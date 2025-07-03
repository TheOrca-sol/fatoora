from flask import Blueprint, request, jsonify, abort, send_file
from backend.utils.firebase_auth import verify_firebase_token
from backend.models.invoice import Invoice
from backend.models.client import Client
from backend.models.team import Team
from backend.models.teammembership import TeamMembership
from backend.models.user import User
from backend.database import db
from datetime import datetime
from backend.utils.pdf import render_invoice_pdf
import io
import os

invoices_bp = Blueprint('invoices', __name__)

def get_current_user_and_team():
    user_info = verify_firebase_token()
    user = User.query.filter_by(firebase_uid=user_info['uid']).first()
    if not user:
        # Always try to find by email, even if firebase_uid is different or empty
        user_by_email = User.query.filter_by(email=user_info.get('email', '')).first()
        if user_by_email:
            user_by_email.firebase_uid = user_info['uid']
            user_by_email.name = user_info.get('name', user_by_email.name)
            db.session.commit()
            user = user_by_email
        else:
            user = User(
                firebase_uid=user_info['uid'],
                email=user_info.get('email', ''),
                name=user_info.get('name', '')
            )
            db.session.add(user)
            db.session.commit()
    membership = TeamMembership.query.filter_by(user_id=user.id).first()
    if not membership:
        # Auto-create a team for this user
        team = Team(name=f"{user.name or user.email}'s Team", owner_id=user.id)
        db.session.add(team)
        db.session.commit()
        membership = TeamMembership(user_id=user.id, team_id=team.id, role='owner')
        db.session.add(membership)
        db.session.commit()
        return user, team
    return user, membership.team

def generate_invoice_number(team_id):
    last_invoice = Invoice.query.filter_by(team_id=team_id).order_by(Invoice.id.desc()).first()
    if last_invoice:
        last_number = int(last_invoice.number)
        return str(last_number + 1)
    else:
        return '1'

@invoices_bp.route('/', methods=['GET'])
def list_invoices():
    user, team = get_current_user_and_team()
    status_filter = request.args.get('status')
    now = datetime.utcnow().date()
    invoices = Invoice.query.filter_by(team_id=team.id).all()
    result = []
    for inv in invoices:
        # Auto-calculate overdue
        if inv.status == 'unpaid' and inv.due_date and inv.due_date < now:
            inv.status = 'overdue'
            db.session.commit()
        if status_filter and inv.status != status_filter:
            continue
        result.append({
            'id': inv.id,
            'number': inv.number,
            'client_id': inv.client_id,
            'status': inv.status,
            'amount': inv.amount,
            'currency': inv.currency,
            'due_date': inv.due_date.isoformat() if inv.due_date else None,
            'created_at': inv.created_at.isoformat() if inv.created_at else None
        })
    return jsonify(result)

@invoices_bp.route('/', methods=['POST'])
def create_invoice():
    user, team = get_current_user_and_team()
    data = request.json
    client_id = data.get('client_id')
    client = Client.query.filter_by(id=client_id, team_id=team.id).first()
    if not client:
        abort(400, 'Client not found or not in your team')
    number = generate_invoice_number(team.id)
    invoice = Invoice(
        team_id=team.id,
        client_id=client.id,
        number=number,
        status=data.get('status', 'unpaid'),
        amount=data.get('amount'),
        currency=data.get('currency', 'MAD'),
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
    )
    db.session.add(invoice)
    db.session.commit()
    return jsonify({'id': invoice.id, 'number': invoice.number}), 201

@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    user, team = get_current_user_and_team()
    invoice = Invoice.query.filter_by(id=invoice_id, team_id=team.id).first()
    if not invoice:
        abort(404, 'Invoice not found')
    return jsonify({
        'id': invoice.id,
        'number': invoice.number,
        'client_id': invoice.client_id,
        'status': invoice.status,
        'amount': invoice.amount,
        'currency': invoice.currency,
        'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
        'created_at': invoice.created_at.isoformat() if invoice.created_at else None
    })

@invoices_bp.route('/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    user, team = get_current_user_and_team()
    invoice = Invoice.query.filter_by(id=invoice_id, team_id=team.id).first()
    if not invoice:
        abort(404, 'Invoice not found')
    data = request.json
    if 'client_id' in data:
        client = Client.query.filter_by(id=data['client_id'], team_id=team.id).first()
        if not client:
            abort(400, 'Client not found or not in your team')
        invoice.client_id = client.id
    invoice.status = data.get('status', invoice.status)
    invoice.amount = data.get('amount', invoice.amount)
    invoice.currency = data.get('currency', invoice.currency)
    if 'due_date' in data:
        invoice.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
    db.session.commit()
    return jsonify({'success': True})

@invoices_bp.route('/<int:invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    user, team = get_current_user_and_team()
    invoice = Invoice.query.filter_by(id=invoice_id, team_id=team.id).first()
    if not invoice:
        abort(404, 'Invoice not found')
    db.session.delete(invoice)
    db.session.commit()
    return jsonify({'success': True})

@invoices_bp.route('/<int:invoice_id>/pdf', methods=['GET'])
def download_invoice_pdf(invoice_id):
    user, team = get_current_user_and_team()
    invoice = Invoice.query.filter_by(id=invoice_id, team_id=team.id).first()
    if not invoice:
        abort(404, 'Invoice not found')
    client = Client.query.filter_by(id=invoice.client_id, team_id=team.id).first()
    if not client:
        abort(404, 'Client not found')
    
    # Convert logo URL to file path if it exists
    logo_path = None
    if team.logo_url:
        # Extract filename from URL like '/api/teams/logo/team_1_logo_filename.png'
        filename = team.logo_url.split('/')[-1]
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'uploads', filename)
        # Check if file actually exists
        if not os.path.exists(logo_path):
            logo_path = None
    
    pdf_bytes = render_invoice_pdf(invoice, client, team, logo_url=logo_path)
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'invoice_{invoice.number}.pdf'
    )

@invoices_bp.route('/<int:invoice_id>/status', methods=['PATCH'])
def update_invoice_status(invoice_id):
    user, team = get_current_user_and_team()
    invoice = Invoice.query.filter_by(id=invoice_id, team_id=team.id).first()
    if not invoice:
        abort(404, 'Invoice not found')
    data = request.json
    status = data.get('status')
    if status not in ['paid', 'unpaid']:
        abort(400, 'Status must be "paid" or "unpaid"')
    invoice.status = status
    db.session.commit()
    return jsonify({'success': True, 'status': invoice.status}) 