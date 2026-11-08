import pytest
from jsonschema import validate

from data.geofence_data import ORIGINAL_GEOFENCE, NON_EXISTING_ID, VALID_UPDATES, INVALID_UPDATES
from data.geofence_schema import GEOFENCE_SCHEMA
from utils.status_codes import StatusCode
from utils.params import as_params

# Every test gets a fresh geofence from the existing_geofence fixture.
# Traccar's PUT replaces the whole geofence, so we send the full object with our changes on top.


@pytest.mark.parametrize("data", as_params(VALID_UPDATES))
def test_update_geofence_with_valid_data(traccar_api, existing_geofence, data):
    updated_geofence = {**existing_geofence, **data["changes"]}

    response = traccar_api.update_geofence(existing_geofence["id"], updated_geofence)

    assert response.status_code == StatusCode.OK
    for field, new_value in data["changes"].items():
        assert response.json()[field] == new_value

    # Read it back: the change must be saved
    saved = traccar_api.get_geofence(existing_geofence["id"]).json()
    for field, new_value in data["changes"].items():
        assert saved[field] == new_value


@pytest.mark.parametrize("data", as_params(INVALID_UPDATES))
def test_update_geofence_with_invalid_data_is_rejected(traccar_api, existing_geofence, data):
    updated_geofence = {**existing_geofence, **data["changes"]}

    response = traccar_api.update_geofence(existing_geofence["id"], updated_geofence)

    assert response.status_code == StatusCode.BAD_REQUEST

    # The original geofence must not change
    saved = traccar_api.get_geofence(existing_geofence["id"]).json()
    assert saved["name"] == ORIGINAL_GEOFENCE["name"]
    assert saved["area"] == ORIGINAL_GEOFENCE["area"]


# TC-UPDATE-12
@pytest.mark.xfail(reason="BUG-API-006: missing geofence returns 400 instead of 404", strict=True)
def test_update_geofence_that_does_not_exist_returns_not_found(traccar_api, existing_geofence):
    updated_geofence = {**existing_geofence, "id": NON_EXISTING_ID, "name": "Does not exist"}

    response = traccar_api.update_geofence(NON_EXISTING_ID, updated_geofence)

    assert response.status_code == StatusCode.NOT_FOUND


# TC-UPDATE-13
def test_update_url_and_body_ids_dont_match(traccar_api, existing_geofence):
    # URL points to our geofence, but the body claims a different id
    updated_geofence = {**existing_geofence, "id": NON_EXISTING_ID, "name": "Mismatched id"}

    response = traccar_api.update_geofence(existing_geofence["id"], updated_geofence)

    assert response.status_code == StatusCode.BAD_REQUEST
    saved = traccar_api.get_geofence(existing_geofence["id"]).json()
    assert saved["name"] == ORIGINAL_GEOFENCE["name"]


# TC-UPDATE-14
def test_update_without_login_returns_unauthorized(guest_api, traccar_api, existing_geofence):
    updated_geofence = {**existing_geofence, "name": "Changed without login"}

    response = guest_api.update_geofence(existing_geofence["id"], updated_geofence)

    assert response.status_code == StatusCode.UNAUTHORIZED
    saved = traccar_api.get_geofence(existing_geofence["id"]).json()
    assert saved["name"] == ORIGINAL_GEOFENCE["name"]


# TC-UPDATE-15
def test_update_response_matches_geofence_schema(traccar_api, existing_geofence):
    updated_geofence = {**existing_geofence, "name": "Schema check"}

    response = traccar_api.update_geofence(existing_geofence["id"], updated_geofence)

    assert response.status_code == StatusCode.OK
    validate(instance=response.json(), schema=GEOFENCE_SCHEMA)