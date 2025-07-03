import os
from flask import Flask
from dotenv import load_dotenv
from flask_migrate import Migrate
from backend.database import db

# Load environment variables from .env file in backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models WITHIN app context to avoid circular imports
    with app.app_context():
        from backend.models import user, team, teammembership, client, invoice
        
        # Create tables if they don't exist (for development)
        db.create_all()

    # Import routes AFTER models are loaded
    from backend.routes.auth import auth_bp
    from backend.routes.clients import clients_bp
    from backend.routes.invoices import invoices_bp
    from backend.routes.dashboard import dashboard_bp
    from backend.routes.export import export_bp
    from backend.routes.teams import teams_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(clients_bp, url_prefix='/api/clients')
    app.register_blueprint(invoices_bp, url_prefix='/api/invoices')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(export_bp, url_prefix='/api/export')
    app.register_blueprint(teams_bp, url_prefix='/api/teams')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

# To run migrations:
# flask db init
# flask db migrate -m "Initial migration."
# flask db upgrade
