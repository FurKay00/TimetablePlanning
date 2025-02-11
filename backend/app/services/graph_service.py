import networkx as nx
import math
from app.data.room_data import buildings, floors_per_building, num_rooms_per_floor, building_connections

# Staritng the graph
G = nx.Graph()
average_velocity = 1.65
# Adding intra-building connections
for building in buildings:
    floors = floors_per_building[building]
    for floor in range(floors):
        for room in range(num_rooms_per_floor - 1):
            room1 = f"{building}{floor}{room:02d}"
            room2 = f"{building}{floor}{room + 1:02d}"
            G.add_edge(room1, room2, weight=5)  # Hallway connection with assumption of 5 metres

        if floor < floors - 1:
            first_room_current = f"{building}{floor}00"
            first_room_next = f"{building}{floor+1}00"
            last_room_current = f"{building}{floor}29"
            last_room_next = f"{building}{floor+1}29"

            # Depiction of stairways
            G.add_edge(first_room_current, first_room_next, weight=15)
            G.add_edge(last_room_current, last_room_next, weight=15)

# Addition of inter-building connections
for room1, room2, weight in building_connections:
    G.add_edge(room1, room2, weight=weight)


def find_shortest_path(room1, room2):
    # Method using Djikstra to calculate the shortest path
    if room1 not in G.nodes or room2 not in G.nodes:
        return {"error": "Invalid room ID"}

    try:
        path = nx.shortest_path(G, source=room1, target=room2, weight="weight")
        distance = nx.shortest_path_length(G, source=room1, target=room2, weight="weight")
        time = math.floor(distance / average_velocity)  # estimated time to reach the other room
        return {"room1": room1, "room2": room2, "path": path, "shortest_distance": distance, "estimated_time in seconds": time}
    except nx.NetworkXNoPath:
        return {"error": "No path found between rooms"}


def get_building_connections():
    return {"connections": building_connections}