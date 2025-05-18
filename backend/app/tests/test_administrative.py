def test_get_all_lecturers_empty(client):
    res = client.get("/lecturers/")
    assert res.status_code == 200
    assert res.json() == []


def test_create_and_read_secretary_classes(client, db_session):
    from app.models.models import Class as ClassModel
    cls = ClassModel(id="TINF21B", size=30, secretary_id=5)
    db_session.add(cls)
    db_session.commit()

    res = client.get("/secretary_classes/5")
    assert res.status_code == 200
    assert res.json() == ["TINF21B"]
