from backend.database import db
from datetime import datetime

class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    number = db.Column(db.String, nullable=False)
    status = db.Column(db.String, default='unpaid')
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String, default='MAD')
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Relationships
    team = db.relationship('Team')
    client = db.relationship('Client') 