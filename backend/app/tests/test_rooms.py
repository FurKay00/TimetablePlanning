def test_get_all_rooms_empty(client):
    res = client.get("/all_rooms/")
    assert res.status_code == 200
    data = res.json()
    assert data["rooms"] == []


def test_shortest_path(client):
    payload = {"room1": 101, "room2": 102}
    res = client.post("/shortest_path/", json=payload)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
