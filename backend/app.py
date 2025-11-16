import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the appropriate .env file based on FLASK_ENV
env = os.getenv("FLASK_ENV", "development")
base_dir = Path(__file__).parent

if env == "production":
    load_dotenv(dotenv_path=base_dir / ".env.production")
elif env == "testing":
    load_dotenv(dotenv_path=base_dir / ".env.testing")
else:
    load_dotenv(dotenv_path=base_dir / ".env.development")

from portfolio_app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
