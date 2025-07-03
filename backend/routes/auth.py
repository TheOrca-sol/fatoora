from flask import Blueprint, jsonify
from backend.utils.firebase_auth import verify_firebase_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/me', methods=['GET'])
def me():
    user_info = verify_firebase_token()
    return jsonify(user_info) 