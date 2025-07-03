from flask import Blueprint, jsonify, send_file, abort
from backend.utils.firebase_auth import verify_firebase_token
from backend.models.invoice import Invoice
from backend.models.client import Client
from backend.models.teammembership import TeamMembership
from backend.models.user import User
from backend.models.team import Team
from backend.database import db
from backend.utils.pdf import render_invoice_pdf
import io
import csv
import zipfile
import os

export_bp = Blueprint('export', __name__)

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

@export_bp.route('/invoices/csv', methods=['GET'])
def export_invoices_csv():
    user, team = get_current_user_and_team()
    invoices = Invoice.query.filter_by(team_id=team.id).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Number', 'Client', 'Status', 'Amount', 'Currency', 'Due Date', 'Created At'])
    for inv in invoices:
        client = Client.query.filter_by(id=inv.client_id, team_id=team.id).first()
        writer.writerow([
            inv.id, inv.number, client.name if client else '', inv.status, inv.amount, inv.currency,
            inv.due_date.isoformat() if inv.due_date else '',
            inv.created_at.isoformat() if inv.created_at else ''
        ])
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='invoices.csv'
    )

@export_bp.route('/invoices/zip', methods=['GET'])
def export_invoices_zip():
    user, team = get_current_user_and_team()
    invoices = Invoice.query.filter_by(team_id=team.id).all()
    
    # Convert logo URL to file path if it exists
    logo_path = None
    if team.logo_url:
        # Extract filename from URL like '/api/teams/logo/team_1_logo_filename.png'
        filename = team.logo_url.split('/')[-1]
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'uploads', filename)
        # Check if file actually exists
        if not os.path.exists(logo_path):
            logo_path = None
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zf:
        for inv in invoices:
            client = Client.query.filter_by(id=inv.client_id, team_id=team.id).first()
            pdf_bytes = render_invoice_pdf(inv, client, team, logo_url=logo_path)
            zf.writestr(f'invoice_{inv.number}.pdf', pdf_bytes)
    zip_buffer.seek(0)
    return send_file(
        zip_buffer,
        mimetype='application/zip',
        as_attachment=True,
        download_name='invoices.zip'
    )

# Endpoints to be implemented 