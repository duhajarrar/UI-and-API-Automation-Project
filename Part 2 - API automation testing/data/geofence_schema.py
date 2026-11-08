GEOFENCE_SCHEMA = {
    "type": "object",
    "required": ["id", "name", "description", "area", "calendarId", "attributes"],
    "properties": {
        "id": {"type": "integer", "minimum": 1},
        "name": {"type": "string"},
        "description": {"type": ["string", "null"]},
        "area": {"type": "string", "minLength": 1},
        "calendarId": {"type": ["integer", "null"]},
        "attributes": {"type": "object"},
    },
    "additionalProperties": True,
}

GEOFENCE_LIST_SCHEMA = {
    "type": "array",
    "items": GEOFENCE_SCHEMA,
}