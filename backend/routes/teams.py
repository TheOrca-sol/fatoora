from flask import Blueprint, request, jsonify, abort, send_from_directory
from backend.utils.firebase_auth import verify_firebase_token
from backend.models.team import Team
from backend.models.teammembership import TeamMembership
from backend.models.user import User
from backend.database import db
import os

teams_bp = Blueprint('teams', __name__)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

@teams_bp.route('/me', methods=['GET'])
def get_team_info():
    user, team = get_current_user_and_team()
    members = TeamMembership.query.filter_by(team_id=team.id).all()
    member_list = []
    for m in members:
        u = User.query.get(m.user_id)
        member_list.append({'id': u.id, 'email': u.email, 'name': u.name, 'role': m.role})
    return jsonify({
        'id': team.id,
        'name': team.name,
        'logo_url': team.logo_url,
        'members': member_list
    })

@teams_bp.route('/invite', methods=['POST'])
def invite_member():
    user, team = get_current_user_and_team()
    data = request.json
    email = data.get('email')
    if not email:
        abort(400, 'Email required')
    invitee = User.query.filter_by(email=email).first()
    if not invitee:
        invitee = User(email=email, firebase_uid='', name='')
        db.session.add(invitee)
        db.session.commit()
    if TeamMembership.query.filter_by(user_id=invitee.id, team_id=team.id).first():
        abort(400, 'User already a member')
    membership = TeamMembership(user_id=invitee.id, team_id=team.id, role='member')
    db.session.add(membership)
    db.session.commit()
    return jsonify({'success': True})

@teams_bp.route('/remove', methods=['POST'])
def remove_member():
    user, team = get_current_user_and_team()
    data = request.json
    user_id = data.get('user_id')
    if not user_id:
        abort(400, 'user_id required')
    membership = TeamMembership.query.filter_by(user_id=user_id, team_id=team.id).first()
    if not membership:
        abort(404, 'Membership not found')
    db.session.delete(membership)
    db.session.commit()
    return jsonify({'success': True})

@teams_bp.route('/update', methods=['POST'])
def update_team():
    user, team = get_current_user_and_team()
    data = request.json
    if 'name' in data:
        team.name = data['name']
    db.session.commit()
    return jsonify({'success': True, 'name': team.name})

@teams_bp.route('/logo', methods=['POST'])
def upload_logo():
    user, team = get_current_user_and_team()
    if 'logo' not in request.files:
        abort(400, 'No logo file uploaded')
    file = request.files['logo']
    filename = f'team_{team.id}_logo_{file.filename}'
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    team.logo_url = f'/api/teams/logo/{filename}'
    db.session.commit()
    return jsonify({'success': True, 'logo_url': team.logo_url})

@teams_bp.route('/logo/<filename>', methods=['GET'])
def get_logo(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@teams_bp.route('/list', methods=['GET'])
def list_teams():
    user_info = verify_firebase_token()
    user = User.query.filter_by(firebase_uid=user_info['uid']).first()
    if not user:
        abort(401, 'User not found')
    memberships = TeamMembership.query.filter_by(user_id=user.id).all()
    teams = []
    for m in memberships:
        t = Team.query.get(m.team_id)
        teams.append({'id': t.id, 'name': t.name, 'logo_url': t.logo_url})
    return jsonify(teams)

@teams_bp.route('/switch', methods=['POST'])
def switch_team():
    user_info = verify_firebase_token()
    user = User.query.filter_by(firebase_uid=user_info['uid']).first()
    if not user:
        abort(401, 'User not found')
    data = request.json
    team_id = data.get('team_id')
    membership = TeamMembership.query.filter_by(user_id=user.id, team_id=team_id).first()
    if not membership:
        abort(403, 'Not a member of this team')
    # For demo: store active team in language_preference (should use session or dedicated field)
    user.language_preference = f'active_team:{team_id}'
    db.session.commit()
    return jsonify({'success': True, 'active_team_id': team_id})

@teams_bp.route('/delete', methods=['POST'])
def delete_team():
    user_info = verify_firebase_token()
    user = User.query.filter_by(firebase_uid=user_info['uid']).first()
    if not user:
        abort(401, 'User not found')
    data = request.json
    team_id = data.get('team_id')
    team = Team.query.get(team_id)
    if not team:
        abort(404, 'Team not found')
    if team.owner_id != user.id:
        abort(403, 'Only the team owner can delete the team')
    # Delete memberships
    TeamMembership.query.filter_by(team_id=team.id).delete()
    # Delete the team
    db.session.delete(team)
    db.session.commit()
    return jsonify({'success': True})

# Endpoints to be implemented 