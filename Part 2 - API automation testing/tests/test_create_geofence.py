import pytest
from jsonschema import validate

from data.geofence_data import VALID_GEOFENCES, INVALID_GEOFENCES, NON_EXISTING_ID
from data.geofence_schema import GEOFENCE_SCHEMA, GEOFENCE_LIST_SCHEMA
from utils.status_codes import StatusCode
from utils.params import as_params


def build_geofence(data):
    """Turns a data row into the request body: only name, description, and area."""
    geofence = {"description": "Created by automated API tests", "area": data["area"]}
    if "name" in data:
        geofence["name"] = data["name"]
    return geofence


@pytest.mark.parametrize("data", as_params(VALID_GEOFENCES))
def test_create_valid_geofence(traccar_api, created_geofences, data):
    response = traccar_api.create_geofence(build_geofence(data))

    assert response.status_code == StatusCode.OK, f"Server answered: {response.text[:200]}"
    geofence = response.json()
    created_geofences.append(geofence["id"])  # cleanup after the test

    assert geofence["id"] > 0
    assert geofence["name"] == data["name"]
    assert geofence["area"] == data["area"]

    # Read it back: the new geofence must be in the list
    all_ids = [item["id"] for item in traccar_api.get_geofences().json()]
    assert geofence["id"] in all_ids


@pytest.mark.parametrize("data", as_params(INVALID_GEOFENCES))
def test_create_invalid_geofence_is_rejected(traccar_api, created_geofences, data):
    response = traccar_api.create_geofence(build_geofence(data))

    # If the API wrongly accepts it, still clean it up
    if response.status_code == StatusCode.OK:
        created_geofences.append(response.json()["id"])

    assert response.status_code == StatusCode.BAD_REQUEST


# TC-CREATE-17
def test_create_without_login_returns_unauthorized(guest_api):
    response = guest_api.create_geofence(build_geofence(VALID_GEOFENCES[0]))

    assert response.status_code == StatusCode.UNAUTHORIZED


# TC-CREATE-18
def test_create_without_id_generates_a_new_id(traccar_api, created_geofences):
    response = traccar_api.create_geofence({"name": "No id test", "area": "CIRCLE (31.959 35.1823, 500)"})

    assert response.status_code == StatusCode.OK
    geofence = response.json()
    created_geofences.append(geofence["id"])
    assert geofence["id"] > 0


# TC-CREATE-19
def test_create_with_existing_id_does_not_overwrite(traccar_api, created_geofences):
    original = traccar_api.create_geofence(build_geofence(VALID_GEOFENCES[0])).json()
    created_geofences.append(original["id"])

    # Send a create with the SAME id, as if trying to overwrite the existing geofence
    response = traccar_api.create_geofence(
        {"id": original["id"], "name": "Overwrite attempt", "area": "CIRCLE (31.9 35.2, 100)"}
    )

    assert response.status_code == StatusCode.OK
    new_geofence = response.json()
    created_geofences.append(new_geofence["id"])
    assert new_geofence["id"] != original["id"]  # a new geofence is created

    # The original geofence must not change
    saved_original = next(item for item in traccar_api.get_geofences().json() if item["id"] == original["id"])
    assert saved_original["name"] == original["name"]
    assert saved_original["area"] == original["area"]


# ---------- Schema validation: the shape of the response, not just the values ----------


# TC-CREATE-20
def test_create_response_matches_geofence_schema(traccar_api, created_geofences):
    response = traccar_api.create_geofence(build_geofence(VALID_GEOFENCES[0]))
    geofence = response.json()
    created_geofences.append(geofence["id"])

    validate(instance=geofence, schema=GEOFENCE_SCHEMA)


# TC-CREATE-21
def test_create_geofence_list_matches_schema(traccar_api, created_geofences):
    geofence = traccar_api.create_geofence(build_geofence(VALID_GEOFENCES[0])).json()
    created_geofences.append(geofence["id"])

    response = traccar_api.get_geofences()

    assert response.status_code == StatusCode.OK
    validate(instance=response.json(), schema=GEOFENCE_LIST_SCHEMA)


# TC-CREATE-22
def test_create_response_is_json(traccar_api, created_geofences):
    response = traccar_api.create_geofence(build_geofence(VALID_GEOFENCES[0]))
    created_geofences.append(response.json()["id"])

    assert "application/json" in response.headers["Content-Type"]



# TC-CREATE-24
@pytest.mark.xfail(reason="BUG-API-003: error responses expose the server's stack trace", strict=True)
def test_error_response_hides_server_details(traccar_api):
    # Reading a geofence that doesn't exist returns an error. It doesn't depend on BUG-API-002,
    # so this test stays valid even if the Arabic name issue is fixed first.
    response = traccar_api.get_geofence(NON_EXISTING_ID)

    assert "Exception" not in response.text
    assert "org.traccar" not in response.text