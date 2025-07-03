from backend.database import db

class Team(db.Model):
    __tablename__ = 'teams'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    logo_url = db.Column(db.String)
    # Relationships
    memberships = db.relationship('TeamMembership', back_populates='team')
    owner = db.relationship('User', foreign_keys=[owner_id]) 