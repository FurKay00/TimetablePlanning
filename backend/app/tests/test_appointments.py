import json
from datetime import date, time
import pytest


@pytest.mark.parametrize("room_id, expected_count", [
    (101, 0),
    (None, 0),
])
def test_get_appointments_with_filters(client, room_id, expected_count):
    url = "/"
    params = {}
    if room_id is not None:
        params["room_id"] = room_id
    res = client.get("/?"+ "&".join(f"{k}={v}" for k,v in params.items()))
    assert res.status_code == 200
    body = res.json()
    assert len(body["appointments"]) == expected_count


def test_create_read_update_delete_basic_appointment(client):
    payload = {
        "type": "Lecture",
        "title": "Graph Theory",
        "module": "MATH200",
        "date": "2025-06-10",
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "lec_ids": [1, 2],
        "class_ids": ["TINF21A"],
        "room_ids": [101]
    }
    res = client.post("/basic/", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["appointment"]["title"] == "Graph Theory"
    app_id = data["appointment"]["id"]

    res = client.get(f"/appointment_basic/{app_id}")
    assert res.status_code == 200
    view = res.json()
    assert view["title"] == "Graph Theory"
    assert view["lecturers"][0]["lec_id"] == 1

    updated = {
        "id": app_id,
        "type": "Seminar",
        "title": "Graph Seminar",
        "module": "MATH200",
        "date": "2025-06-11",
        "start_time": "09:00:00",
        "end_time": "10:30:00",
        "lec_ids": [2],
        "class_ids": ["TINF21A"],
        "room_ids": [102]
    }
    res = client.put("/basic/", json=[updated])
    assert res.status_code == 200
    upd_app = res.json()[0]
    assert upd_app["title"] == "Graph Seminar"
    assert upd_app["rooms"][0]["room_id"] == 102

    res = client.delete(f"/basic/{app_id}")
    assert res.status_code == 204

    res = client.get(f"/appointment_basic/{app_id}")
    assert res.status_code == 404
