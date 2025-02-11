buildings = ["A", "B", "C", "D", "E", "F"]
floors_per_building = {"A": 3, "B": 5, "C": 5, "D": 5, "E": 3, "F": 3}
num_rooms_per_floor = 30

building_connections = [
    ("A000", "B000", 10),
    ("A200", "B229", 5),
    ("B000", "C200", 5),
    ("C000", "D000", 20),
    ("D000", "E000", 10),
    ("E000", "F000", 10),
    ("F229", "E200", 25),
]
