from backend.database import db

class TeamMembership(db.Model):
    __tablename__ = 'team_memberships'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    role = db.Column(db.String, default='member')
    # Relationships
    user = db.relationship('User', back_populates='memberships')
    team = db.relationship('Team', back_populates='memberships') 