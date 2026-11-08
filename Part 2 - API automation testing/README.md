# Traccar Location API – Automated Tests

Automated REST API tests for **sending location information to a map, then changing and deleting it**, using the [Traccar](https://www.traccar.org) GPS tracking platform.

| | |
| --- | --- |
| **API under test** | Traccar REST API – [API reference (Swagger)](https://www.traccar.org/api-reference/) |
| **Server** | Public demo server – `https://demo.traccar.org` · Traccar **6.16.0** |
| **Tools** | Python, pytest, requests, jsonschema, pytest-html |
| **Tests** | 44 |
| **Bugs found** | [7](#bugs-found) |

## 1. What the project tests

Traccar tracks GPS devices, such as phones and cars, and shows them on a map. A **geofence** is an area drawn on that map, defined by coordinates, for example "a 500 m circle around Birzeit University". Traccar uses geofences for alerts like "notify me when a car enters this area".

**Creating a geofence is how this project sends location information to the map:** every geofence carries coordinates that are drawn on it. The tests then change those locations and delete them.

### API endpoints under test

Base URL: `https://demo.traccar.org` · Authentication: session login (`POST /api/session`) or Basic auth · Body: JSON

| Action | Method and URL | Request body | Success response |
| --- | --- | --- | --- |
| **Create** (send a location to the map) | `POST https://demo.traccar.org/api/geofences` | `name`, `description`, `area` | `200 OK` + the new geofence with its `id` |
| **Update** | `PUT https://demo.traccar.org/api/geofences/{id}` | The full geofence, including `id`, with the changed fields | `200 OK` + the updated geofence |
| **Delete** | `DELETE https://demo.traccar.org/api/geofences/{id}` | None | `204 No Content` |

The tests also read data back to check that each change was really saved:

| Action | Method and URL | Used to |
| --- | --- | --- |
| Read one | `GET https://demo.traccar.org/api/geofences/{id}` | Confirm an update was saved, or that a deleted geofence is gone |
| Read all | `GET https://demo.traccar.org/api/geofences` | Confirm a new geofence is in the list, and validate the list schema |

### How the task requirements are covered

| Requirement | Covered by |
| --- | --- |
| **Create data** by sending location information to the map: **proper** information | Circles, polygons, and lines with valid coordinates (TC-CREATE-01 to 03) |
| **Create data**: **invalid** information | Coordinates out of range, text instead of numbers, unknown shapes, broken or empty areas, missing name (TC-CREATE-09 to 16) |
| **Create data**: **edge cases** | Max and min latitude and longitude, 1 m radius, Arabic and special-character names, no `id`, reusing an existing `id` (TC-CREATE-04 to 08, 18, 19) |
| **Modify existing data** | Valid changes to name, location, size, shape, and description (TC-UPDATE-01 to 06), invalid changes (TC-UPDATE-07 to 11), missing geofence, mismatched ids, no login (TC-UPDATE-12 to 14) |
| **Delete data** | Delete, check it's gone, delete twice, missing geofence, no login, text id (TC-DELETE-01 to 06) |
| **At least 3 HTTP response codes** | 200, 204, 400, 401, 404 (see [below](#http-response-codes-covered)) |
| **Bug tickets** | [7 bugs](#bugs-found), one file each in `bugs/` |

### Geofence area format (WKT)

A geofence's shape is sent in the `area` field as text, in a format called **WKT** (Well-Known Text).

> ⚠️ Traccar writes **latitude first, then longitude**. Standard WKT uses the opposite order, so this is easy to get wrong.

| Shape | Format | Example | Rules |
| --- | --- | --- | --- |
| **Circle** | `CIRCLE (lat lon, radius)` | `CIRCLE (31.959 35.1823, 500)` | One center point and a radius in **meters**. Radius must be greater than 0 |
| **Polygon** | `POLYGON ((lat lon, lat lon, ..., lat lon))` | `POLYGON ((31.905 35.2, 31.905 35.21, 31.9 35.21, 31.9 35.2, 31.905 35.2))` | At least 3 corners. The **last point must repeat the first** to close the shape. Note the double brackets |
| **Line** | `LINESTRING (lat lon, lat lon, ...)` | `LINESTRING (31.95 35.18, 31.96 35.19)` | At least 2 points, for example a road |

**Rules for every shape:**

| Value | Allowed range | Written as |
| --- | --- | --- |
| Latitude | -90 to 90 | Number, `.` for decimals |
| Longitude | -180 to 180 | Number, `.` for decimals |
| Between latitude and longitude | – | A space: `31.959 35.1823` |
| Between points | – | A comma: `31.95 35.18, 31.96 35.19` |

**Example request:**

```http
POST /api/geofences
Content-Type: application/json

{
  "name": "Birzeit University",
  "description": "Campus area",
  "area": "CIRCLE (31.959 35.1823, 500)"
}
```

## 2. Test report

Latest full run: October 24, 2026 · Traccar demo server 6.16.0 · **44 tests: 25 passed, 19 known bugs (xfail), 0 failed**.

**Legend:** ✅ Passed · ⚠️ Known bug (expected to fail, marked `xfail`)

The full HTML report, with request details for every test, is created at `reports/report.html` after each run.

### Create a geofence – `tests/test_create_geofence.py`

| Test case | Description | Status | Bug (priority) |
| --- | --- | --- | --- |
| TC-CREATE-01 | Circle | ✅ | |
| TC-CREATE-02 | Polygon | ✅ | |
| TC-CREATE-03 | Line | ✅ | |
| TC-CREATE-04 | Max latitude and longitude (90, 180) | ✅ | |
| TC-CREATE-05 | Min latitude and longitude (-90, -180) | ✅ | |
| TC-CREATE-06 | Very small radius (1 m) | ✅ | |
| TC-CREATE-07 | Arabic name | ⚠️ | [BUG-API-002](bugs/BUG-API-002-arabic-names-not-saved.md) (High) |
| TC-CREATE-08 | Special characters in the name | ✅ | |
| TC-CREATE-09 | Latitude above 90 → 400 | ⚠️ | [BUG-API-004](bugs/BUG-API-004-out-of-range-coordinates-accepted.md) (Medium) |
| TC-CREATE-10 | Longitude above 180 → 400 | ⚠️ | [BUG-API-004](bugs/BUG-API-004-out-of-range-coordinates-accepted.md) (Medium) |
| TC-CREATE-11 | Negative radius → 400 | ⚠️ | [BUG-API-005](bugs/BUG-API-005-negative-radius-accepted.md) (Medium) |
| TC-CREATE-12 | Coordinates are text → 400 | ⚠️ | [BUG-API-001](bugs/BUG-API-001-invalid-area-format-accepted.md) (High) |
| TC-CREATE-13 | Unknown shape → 400 | ⚠️ | [BUG-API-001](bugs/BUG-API-001-invalid-area-format-accepted.md) (High) |
| TC-CREATE-14 | Broken area format → 400 | ⚠️ | [BUG-API-001](bugs/BUG-API-001-invalid-area-format-accepted.md) (High) |
| TC-CREATE-15 | Empty area → 400 | ⚠️ | [BUG-API-001](bugs/BUG-API-001-invalid-area-format-accepted.md) (High) |
| TC-CREATE-16 | Missing name → 400 | ✅ | |
| TC-CREATE-17 | Create without login → 401 | ✅ | |
| TC-CREATE-18 | Create without an `id` → new id generated | ✅ | |
| TC-CREATE-19 | Create with an existing `id` doesn't overwrite it | ✅ | |
| TC-CREATE-20 | Response matches the geofence schema | ✅ | |
| TC-CREATE-21 | Geofence list matches the schema | ✅ | |
| TC-CREATE-22 | Response is JSON | ✅ | |
| TC-CREATE-24 | Error responses hide server details | ⚠️ | [BUG-API-003](bugs/BUG-API-003-stack-trace-exposed.md) (High) |

### Update a geofence – `tests/test_update_geofence.py`

| Test case | Description | Status | Bug (priority) |
| --- | --- | --- | --- |
| TC-UPDATE-01 | Rename | ✅ | |
| TC-UPDATE-02 | Move to new coordinates | ✅ | |
| TC-UPDATE-03 | Make the area bigger | ✅ | |
| TC-UPDATE-04 | Change shape to polygon | ✅ | |
| TC-UPDATE-05 | Change description | ✅ | |
| TC-UPDATE-06 | Arabic name | ⚠️ | [BUG-API-002](bugs/BUG-API-002-arabic-names-not-saved.md) (High) |
| TC-UPDATE-07 | Latitude above 90 → 400, unchanged | ⚠️ | [BUG-API-004](bugs/BUG-API-004-out-of-range-coordinates-accepted.md) (Medium) |
| TC-UPDATE-08 | Negative radius → 400, unchanged | ⚠️ | [BUG-API-005](bugs/BUG-API-005-negative-radius-accepted.md) (Medium) |
| TC-UPDATE-09 | Broken area format → 400, unchanged | ⚠️ | [BUG-API-001](bugs/BUG-API-001-invalid-area-format-accepted.md) (High) |
| TC-UPDATE-10 | Empty area → 400, unchanged | ⚠️ | [BUG-API-001](bugs/BUG-API-001-invalid-area-format-accepted.md) (High) |
| TC-UPDATE-11 | Empty name → 400, unchanged | ⚠️ | [BUG-API-007](bugs/BUG-API-007-empty-name-accepted-on-update.md) (Medium) |
| TC-UPDATE-12 | Geofence that doesn't exist → 404 | ⚠️ | [BUG-API-006](bugs/BUG-API-006-missing-geofence-returns-400.md) (Low) |
| TC-UPDATE-13 | URL and body IDs don't match → 400 | ✅ | |
| TC-UPDATE-14 | Update without login → 401, unchanged | ✅ | |
| TC-UPDATE-15 | Response matches the schema | ✅ | |

### Delete a geofence – `tests/test_delete_geofence.py`

| Test case | Description | Status | Bug (priority) |
| --- | --- | --- | --- |
| TC-DELETE-01 | Delete → 204, no body | ✅ | |
| TC-DELETE-02 | Deleted geofence is gone (404, not in list) | ⚠️ | [BUG-API-006](bugs/BUG-API-006-missing-geofence-returns-400.md) (Low) |
| TC-DELETE-03 | Delete the same geofence twice → 404 | ⚠️ | [BUG-API-006](bugs/BUG-API-006-missing-geofence-returns-400.md) (Low) |
| TC-DELETE-04 | Geofence that doesn't exist → 404 | ⚠️ | [BUG-API-006](bugs/BUG-API-006-missing-geofence-returns-400.md) (Low) |
| TC-DELETE-05 | Delete without login → 401, still exists | ✅ | |
| TC-DELETE-06 | Text id → 404 | ✅ | |

### HTTP response codes covered

| Code | Meaning | Example tests |
| --- | --- | --- |
| **200 OK** | Request succeeded | TC-CREATE-01, TC-UPDATE-01 |
| **204 No Content** | Deleted, nothing to return | TC-DELETE-01 |
| **400 Bad Request** | Invalid data | TC-CREATE-16, TC-UPDATE-13 |
| **401 Unauthorized** | Not logged in | TC-CREATE-17, TC-UPDATE-14, TC-DELETE-05 |
| **404 Not Found** | Item doesn't exist | TC-DELETE-06 |

## Bugs found

| Bug | Summary | Priority | Tests |
| --- | --- | --- | --- |
| [BUG-API-001](bugs/BUG-API-001-invalid-area-format-accepted.md) | API saves geofences with an invalid area, which crashes the Geofences page | **High** | TC-CREATE-12 to 15, TC-UPDATE-09, 10 |
| [BUG-API-002](bugs/BUG-API-002-arabic-names-not-saved.md) | Geofence names in Arabic (non-Latin letters) can't be saved | **High** | TC-CREATE-07, TC-UPDATE-06 |
| [BUG-API-003](bugs/BUG-API-003-stack-trace-exposed.md) | Error responses expose the server's internal details (stack trace) | **High** | TC-CREATE-24 |
| [BUG-API-004](bugs/BUG-API-004-out-of-range-coordinates-accepted.md) | API accepts coordinates that don't exist on Earth | Medium | TC-CREATE-09, 10, TC-UPDATE-07 |
| [BUG-API-005](bugs/BUG-API-005-negative-radius-accepted.md) | API accepts a circle with a negative radius | Medium | TC-CREATE-11, TC-UPDATE-08 |
| [BUG-API-006](bugs/BUG-API-006-missing-geofence-returns-400.md) | Missing geofence returns 400 Bad Request instead of 404 Not Found | Low | TC-DELETE-02, 03, 04, TC-UPDATE-12 |
| [BUG-API-007](bugs/BUG-API-007-empty-name-accepted-on-update.md) | A geofence's name can be changed to empty, although create requires a name | Medium | TC-UPDATE-11 |

**How known bugs are handled:** the tests stay in the suite and are marked `xfail` with the bug ID, so the run stays green and the report shows which bug each one belongs to. The mark is `strict`, so the day a bug is fixed, its test reports **XPASS (failed)**. That's the reminder to remove the mark and close the bug.

## 3. Setup and run

### Requirements

- Python 3.10 or newer
- A free account on the Traccar demo server: https://demo.traccar.org

### Install

```bash
cd 'Part 2 - API automation testing'
py -m pip install -r requirements.txt
```

### Add your account

Copy `.env.example` to `.env` and fill in your demo server account. `.env` is ignored by git, so it's never committed.

```bash
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

```
TRACCAR_EMAIL=your-email@example.com
TRACCAR_PASSWORD=your-password
```

### Run the regression

| Command | What it runs |
| --- | --- |
| `py -m pytest` | All tests |
| `py -m pytest tests/test_create_geofence.py` | One file |
| `py -m pytest -k "TC-CREATE-09"` | One data-driven case, by test case ID |
| `py -m pytest -k "url_and_body_ids"` | One test, by part of its name |
| `py -m pytest -rxX` | All tests, with a summary of known bugs at the end |

After every run, open **`reports/report.html`** in a browser. Its **Environment** table shows the server and the Traccar version that was tested.

### Run in GitLab CI

Add `TRACCAR_EMAIL` and `TRACCAR_PASSWORD` under **Settings → CI/CD → Variables**, both **masked**. The pipeline installs the requirements, runs `pytest`, and keeps `reports/report.html` as a job artifact.

## 4. Project structure

```
Part 2 - API automation testing/
├── api/traccar_api.py        All API calls in one class (like a Page Object for the API)
├── data/
│   ├── geofence_data.py      Test data for create and update (data-driven rows)
│   └── geofence_schema.py    JSON Schema: the expected shape of a geofence
├── utils/
│   ├── config.py             Reads settings and the account from .env
│   ├── status_codes.py       HTTP status codes by name
│   └── params.py             Turns data rows into named tests, marks known bugs
├── tests/                    One file per operation
├── bugs/                     One file per bug, with screenshots in bugs/images/
├── conftest.py               Fixtures: logged-in client, test geofence, cleanup
└── pytest.ini                Report settings
```