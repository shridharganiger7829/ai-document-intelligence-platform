
import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60

    # Document storage
    UPLOAD_FOLDER = os.path.abspath(
        os.path.join(BASE_DIR, "..", "uploads")
    )

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
