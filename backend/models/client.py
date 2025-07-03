from backend.database import db

class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    name = db.Column(db.String, nullable=False)
    phone = db.Column(db.String)
    ice = db.Column(db.String)
    if_number = db.Column(db.String)
    # Relationships
    team = db.relationship('Team') 