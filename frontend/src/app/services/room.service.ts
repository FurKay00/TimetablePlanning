import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {RoomModel, RoomView} from '../models/response_models';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  URL: string = "http://127.0.0.1:8000/api/v1/rooms/";
  currentRooms: RoomView[] = [];


  constructor(private http: HttpClient) { }

  retrieveAllRooms():Observable<RoomView[]> {
    return this.http.get<
      RoomModel[]
    >(this.URL+"room_models/")
      .pipe(
        map(response => response.map(room => this.mapToRoomView(room))
        )
      );
  }

  mapToRoomView(room:RoomModel):RoomView{
    return {
      room_id: room.id,
      room_name: room.building + " " + room.room,
      capacity: room.capacity
    }
  };
}
