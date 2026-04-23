from flask import Flask
from flask_cors import CORS
from app.extensions import db
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)



    # Init extensions
    db.init_app(app)

    # Allow requests from Vite dev server
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

    # Register blueprints
    from app.modules.health_route import health_bp
    from app.modules.auth.routes import auth_bp
    from app.modules.upload.routes import upload_bp
    from app.modules.study.routes import study_bp
    from app.modules.quiz.routes import quiz_bp
    from app.modules.assessment.routes import assessment_bp
    from app.modules.recommendation.routes import recommendation_bp
    from app.modules.chatbot.routes import chatbot_bp





    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(upload_bp, url_prefix="/api/upload")
    app.register_blueprint(study_bp, url_prefix="/api/study")
    app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
    app.register_blueprint(assessment_bp, url_prefix="/api/assessment")
    app.register_blueprint(recommendation_bp, url_prefix="/api/recommendation")
    app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")




   

    return app