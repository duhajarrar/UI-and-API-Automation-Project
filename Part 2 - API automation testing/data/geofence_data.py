# Geofence = an area on the map. "area" uses WKT format: latitude first, then longitude.
#   CIRCLE (lat lon, radius in meters)
#   POLYGON ((lat lon, lat lon, ..., first point again))
#   LINESTRING (lat lon, lat lon)

VALID_GEOFENCES = [
    {"id": "TC-CREATE-01", "title": "circle", "name": "Birzeit University", "area": "CIRCLE (31.959 35.1823, 500)"},
    {"id": "TC-CREATE-02", "title": "polygon","name": "Ramallah center","area": "POLYGON ((31.905 35.2, 31.905 35.21, 31.9 35.21, 31.9 35.2, 31.905 35.2))"},
    {"id": "TC-CREATE-03", "title": "line", "name": "Main road", "area": "LINESTRING (31.95 35.18, 31.96 35.19)"},
    {"id": "TC-CREATE-04", "title": "max latitude and longitude", "name": "North east edge", "area": "CIRCLE (90 180, 100)"},
    {"id": "TC-CREATE-05", "title": "min latitude and longitude", "name": "South west edge", "area": "CIRCLE (-90 -180, 100)"},
    {"id": "TC-CREATE-06", "title": "very small radius", "name": "Tiny area", "area": "CIRCLE (31.959 35.1823, 1)"},
    {"id": "TC-CREATE-07","title": "Arabic name","name": "جامعة بيرزيت","area": "CIRCLE (31.959 35.1823, 500)","bug": "BUG-API-002: names in Arabic (non-Latin) can't be saved"},
    {"id": "TC-CREATE-08","title": "special characters in name","name": "Tom & Jerry's \"Cafe\" <Ramallah>","area": "CIRCLE (31.9 35.2, 200)"},
]

INVALID_GEOFENCES = [
    {"id": "TC-CREATE-09", "title": "latitude above 90", "name": "Bad latitude", "area": "CIRCLE (91 35.2, 500)", "bug": "BUG-API-004: out-of-range coordinates are accepted"},
    {"id": "TC-CREATE-10", "title": "longitude above 180", "name": "Bad longitude", "area": "CIRCLE (31.9 181, 500)", "bug": "BUG-API-004: out-of-range coordinates are accepted"},
    {"id": "TC-CREATE-11", "title": "negative radius", "name": "Bad radius", "area": "CIRCLE (31.9 35.2, -500)", "bug": "BUG-API-005: a negative radius is accepted"},
    {"id": "TC-CREATE-12", "title": "coordinates are text", "name": "Text coordinates", "area": "CIRCLE (abc def, 500)", "bug": "BUG-API-001: an invalid area format is accepted"},
    {"id": "TC-CREATE-13", "title": "unknown shape", "name": "Unknown shape", "area": "SQUARE (31.9 35.2, 500)", "bug": "BUG-API-001: an invalid area format is accepted"},
    {"id": "TC-CREATE-14", "title": "broken area format", "name": "Broken area", "area": "CIRCLE (31.9", "bug": "BUG-API-001: an invalid area format is accepted"},
    {"id": "TC-CREATE-15", "title": "empty area", "name": "Empty area", "area": "", "bug": "BUG-API-001: an invalid area format is accepted"},
    {"id": "TC-CREATE-16", "title": "missing name", "area": "CIRCLE (31.9 35.2, 500)"},
]

# ---------- Update and delete ----------

# Every update and delete test starts from this geofence (created by the existing_geofence fixture)
ORIGINAL_GEOFENCE = {
    "name": "Original geofence",
    "description": "Before update",
    "area": "CIRCLE (31.9 35.2, 300)",
}

NON_EXISTING_ID = 999999999

VALID_UPDATES = [
    {"id": "TC-UPDATE-01", "title": "rename", "changes": {"name": "Renamed geofence"}},
    {"id": "TC-UPDATE-02", "title": "move to new coordinates", "changes": {"area": "CIRCLE (31.95 35.25, 300)"}},
    {"id": "TC-UPDATE-03", "title": "make the area bigger", "changes": {"area": "CIRCLE (31.9 35.2, 1000)"}},
    {"id": "TC-UPDATE-04", "title": "change shape to polygon", "changes": {"area": "POLYGON ((31.905 35.2, 31.905 35.21, 31.9 35.21, 31.9 35.2, 31.905 35.2))"}},
    {"id": "TC-UPDATE-05", "title": "change description", "changes": {"description": "After update"}},
    {"id": "TC-UPDATE-06","title": "Arabic name","changes": {"name": "رام الله"},"bug": "BUG-API-002: names in Arabic (non-Latin) can't be saved"},
]

INVALID_UPDATES = [
    {"id": "TC-UPDATE-07", "title": "latitude above 90", "changes": {"area": "CIRCLE (91 35.2, 300)"}, "bug": "BUG-API-004: out-of-range coordinates are accepted"},
    {"id": "TC-UPDATE-08", "title": "negative radius", "changes": {"area": "CIRCLE (31.9 35.2, -300)"}, "bug": "BUG-API-005: a negative radius is accepted"},
    {"id": "TC-UPDATE-09", "title": "broken area format", "changes": {"area": "CIRCLE (31.9"}, "bug": "BUG-API-001: an invalid area format is accepted"},
    {"id": "TC-UPDATE-10", "title": "empty area", "changes": {"area": ""}, "bug": "BUG-API-001: an invalid area format is accepted"},
    {"id": "TC-UPDATE-11", "title": "empty name", "changes": {"name": ""}, "bug": "BUG-API-007: an empty name is accepted on update"},
]
