from flask import Blueprint, request, jsonify, abort
from backend.utils.firebase_auth import verify_firebase_token
from backend.models.client import Client
from backend.models.team import Team
from backend.models.teammembership import TeamMembership
from backend.models.user import User
from backend.database import db

clients_bp = Blueprint('clients', __name__)

# Helper: get current user and team

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

@clients_bp.route('/', methods=['GET'])
def list_clients():
    user, team = get_current_user_and_team()
    clients = Client.query.filter_by(team_id=team.id).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'phone': c.phone,
        'ice': c.ice,
        'if_number': c.if_number
    } for c in clients])

@clients_bp.route('/', methods=['POST'])
def create_client():
    user, team = get_current_user_and_team()
    data = request.json
    client = Client(
        team_id=team.id,
        name=data.get('name'),
        phone=data.get('phone'),
        ice=data.get('ice'),
        if_number=data.get('if_number')
    )
    db.session.add(client)
    db.session.commit()
    return jsonify({'id': client.id}), 201

@clients_bp.route('/<int:client_id>', methods=['GET'])
def get_client(client_id):
    user, team = get_current_user_and_team()
    client = Client.query.filter_by(id=client_id, team_id=team.id).first()
    if not client:
        abort(404, 'Client not found')
    return jsonify({
        'id': client.id,
        'name': client.name,
        'phone': client.phone,
        'ice': client.ice,
        'if_number': client.if_number
    })

@clients_bp.route('/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    user, team = get_current_user_and_team()
    client = Client.query.filter_by(id=client_id, team_id=team.id).first()
    if not client:
        abort(404, 'Client not found')
    data = request.json
    client.name = data.get('name', client.name)
    client.phone = data.get('phone', client.phone)
    client.ice = data.get('ice', client.ice)
    client.if_number = data.get('if_number', client.if_number)
    db.session.commit()
    return jsonify({'success': True})

@clients_bp.route('/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    user, team = get_current_user_and_team()
    client = Client.query.filter_by(id=client_id, team_id=team.id).first()
    if not client:
        abort(404, 'Client not found')
    db.session.delete(client)
    db.session.commit()
    return jsonify({'success': True}) 