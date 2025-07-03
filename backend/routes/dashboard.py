from flask import Blueprint, jsonify, abort
from backend.utils.firebase_auth import verify_firebase_token
from backend.models.invoice import Invoice
from backend.models.teammembership import TeamMembership
from backend.models.user import User
from backend.models.team import Team
from backend.database import db
from datetime import datetime
from sqlalchemy import extract, func

dashboard_bp = Blueprint('dashboard', __name__)

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

@dashboard_bp.route('/summary', methods=['GET'])
def summary():
    user, team = get_current_user_and_team()
    invoices = Invoice.query.filter_by(team_id=team.id).all()
    total = len(invoices)
    paid = sum(1 for i in invoices if i.status == 'paid')
    unpaid = sum(1 for i in invoices if i.status == 'unpaid')
    overdue = sum(1 for i in invoices if i.status == 'overdue')
    total_revenue = sum(i.amount for i in invoices if i.status == 'paid')
    return jsonify({
        'total_invoices': total,
        'paid': paid,
        'unpaid': unpaid,
        'overdue': overdue,
        'total_revenue': total_revenue
    })

@dashboard_bp.route('/monthly-revenue', methods=['GET'])
def monthly_revenue():
    user, team = get_current_user_and_team()
    year = datetime.utcnow().year
    # Group by month, sum paid invoices
    monthly = db.session.query(
        extract('month', Invoice.created_at).label('month'),
        func.sum(Invoice.amount)
    ).filter(
        Invoice.team_id == team.id,
        Invoice.status == 'paid',
        extract('year', Invoice.created_at) == year
    ).group_by('month').order_by('month').all()
    # Format as {month: revenue}
    result = {int(month): float(amount) for month, amount in monthly}
    return jsonify(result)

# Endpoints to be implemented 