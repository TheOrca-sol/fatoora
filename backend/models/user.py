from backend.database import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String)
    language_preference = db.Column(db.String, default='fr')
    # Relationships
    memberships = db.relationship('TeamMembership', back_populates='user') 