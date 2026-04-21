#app/init
from flask import Flask
from app.extensions import db
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Init extensions
    db.init_app(app)

    # Register blueprints
    from app.routes.health_route import health_bp
    app.register_blueprint(health_bp, url_prefix='/api')

    return app