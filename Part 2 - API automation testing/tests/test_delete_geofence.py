import pytest

from data.geofence_data import NON_EXISTING_ID
from utils.status_codes import StatusCode


# TC-DELETE-01
def test_delete_geofence(traccar_api, existing_geofence):
    response = traccar_api.delete_geofence(existing_geofence["id"])

    assert response.status_code == StatusCode.NO_CONTENT
    assert response.text == ""  # 204 means no body


# TC-DELETE-02
@pytest.mark.xfail(reason="BUG-API-006: missing geofence returns 400 instead of 404", strict=True)
def test_delete_deleted_geofence_is_gone(traccar_api, existing_geofence):
    traccar_api.delete_geofence(existing_geofence["id"])

    get_response = traccar_api.get_geofence(existing_geofence["id"])
    all_ids = [item["id"] for item in traccar_api.get_geofences().json()]

    assert get_response.status_code == StatusCode.NOT_FOUND
    assert existing_geofence["id"] not in all_ids


# TC-DELETE-03
@pytest.mark.xfail(reason="BUG-API-006: missing geofence returns 400 instead of 404", strict=True)
def test_delete_same_geofence_twice_returns_not_found(traccar_api, existing_geofence):
    traccar_api.delete_geofence(existing_geofence["id"])

    response = traccar_api.delete_geofence(existing_geofence["id"])

    assert response.status_code == StatusCode.NOT_FOUND


# TC-DELETE-04
@pytest.mark.xfail(reason="BUG-API-006: missing geofence returns 400 instead of 404", strict=True)
def test_delete_geofence_that_does_not_exist_returns_not_found(traccar_api):
    response = traccar_api.delete_geofence(NON_EXISTING_ID)

    assert response.status_code == StatusCode.NOT_FOUND


# TC-DELETE-05
def test_delete_without_login_returns_unauthorized(guest_api, traccar_api, existing_geofence):
    response = guest_api.delete_geofence(existing_geofence["id"])

    assert response.status_code == StatusCode.UNAUTHORIZED
    # The geofence must still exist
    assert traccar_api.get_geofence(existing_geofence["id"]).status_code == StatusCode.OK


# TC-DELETE-06
def test_delete_with_text_id_returns_not_found(traccar_api):
    response = traccar_api.delete_geofence("abc")

    assert response.status_code == StatusCode.NOT_FOUND
