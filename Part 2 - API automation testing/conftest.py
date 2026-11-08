import pytest

from api.traccar_api import TraccarApi
from utils.config import BASE_URL, EMAIL, PASSWORD
from data.geofence_data import ORIGINAL_GEOFENCE
from utils.status_codes import StatusCode
import requests
from pytest_metadata.plugin import metadata_key


def pytest_configure(config):
    """Adds the server and its version to the "Environment" table of the HTML report."""
    try:
        version = requests.get(f"{BASE_URL}/api/server", timeout=10).json().get("version", "unknown")
    except Exception:
        version = "unknown (server not reachable)"
    config.stash[metadata_key]["Traccar server"] = BASE_URL
    config.stash[metadata_key]["Traccar version"] = version
    
    
@pytest.fixture
def guest_api():
    """A client that is NOT logged in."""
    return TraccarApi(BASE_URL)


@pytest.fixture(scope="session")
def traccar_api():
    """A logged-in client, created once and shared by all tests (fewer logins on a shared server)."""
    api = TraccarApi(BASE_URL)
    response = api.login(EMAIL, PASSWORD)
    assert response.status_code == StatusCode.OK, f"Login failed: {response.status_code} {response.text}"
    return api


@pytest.fixture
def created_geofences(traccar_api):
    """Tests add the IDs of geofences they create here. They're deleted after the test."""
    geofence_ids = []
    yield geofence_ids
    for geofence_id in geofence_ids:
        traccar_api.delete_geofence(geofence_id)
        
@pytest.fixture
def existing_geofence(traccar_api):
    """Creates a fresh geofence before the test and deletes it after.
 
    If the test already deleted it, the cleanup delete just returns 404, which is fine.
    """
    response = traccar_api.create_geofence(ORIGINAL_GEOFENCE)
    assert response.status_code == StatusCode.OK, f"Could not create a geofence: {response.status_code} {response.text}"
    geofence = response.json()
    yield geofence
    traccar_api.delete_geofence(geofence["id"])