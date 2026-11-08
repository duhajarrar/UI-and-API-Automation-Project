import os
from dotenv import load_dotenv

load_dotenv()

def require_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing {name}. Create .env file similar to the .env.example format and set {name} on it")
    return value

BASE_URL = os.getenv("TRACCAR_URL", "https://demo.traccar.org")
EMAIL = require_env("TRACCAR_EMAIL")
PASSWORD = require_env("TRACCAR_PASSWORD")
