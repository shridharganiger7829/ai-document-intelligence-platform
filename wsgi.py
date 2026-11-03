import os
import sys

backend_dir = os.path.join(os.path.dirname(__file__), "Backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load environment variables if .env exists
from dotenv import load_dotenv
env_path = os.path.join(backend_dir, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
