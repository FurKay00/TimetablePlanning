import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs';
import {RoomView} from '../models/response_models';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  URL: string = "http://127.0.0.1:8000/rooms/";
  currentRooms: RoomView[] = [];

  constructor(private http: HttpClient) { }

  retrieveAllRooms() {
    return this.http.get<{
      message: string;
      rooms: RoomView[]
    }>(this.URL + "all_rooms/")
      .pipe(
        map(response => this.currentRooms=response.rooms
        )
      );
  }

}
