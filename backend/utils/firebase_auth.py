import firebase_admin
from firebase_admin import auth, credentials
from flask import request, abort
import os
import logging

# Initialize Firebase Admin SDK (singleton)
if not firebase_admin._apps:
    cred = credentials.Certificate(os.getenv('FIREBASE_ADMIN_CREDENTIALS'))
    firebase_admin.initialize_app(cred)

def verify_firebase_token():
    auth_header = request.headers.get('Authorization', None)
    logging.warning(f"Authorization header: {auth_header}")
    if not auth_header or not auth_header.startswith('Bearer '):
        logging.error("Missing or invalid Authorization header")
        abort(401, 'Missing or invalid Authorization header')
    id_token = auth_header.split(' ')[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        logging.warning(f"Decoded Firebase token: {decoded_token}")
        return decoded_token
    except Exception as e:
        logging.error(f"Invalid Firebase token: {str(e)}")
        abort(401, f'Invalid Firebase token: {str(e)}') 