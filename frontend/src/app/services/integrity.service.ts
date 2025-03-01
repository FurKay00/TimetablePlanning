import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {CalendarEvent} from 'angular-calendar';
import {AppointmentView, ClassModel, RoomModel, RoomView} from '../models/response_models';

@Injectable({
  providedIn: 'root'
})
export class IntegrityService {
  URL: string = "http://127.0.0.1:8000/"

  constructor(private http:HttpClient) {
  }

  checkCapacityOfSelectedClasses(selectedRooms:RoomView[], selectedClasses:ClassModel[]):{message:string, isAllowed:boolean}{
    let totalSize:number = 0;
    let totalCapacity:number = 0;
    let message:string = "";
    let isAllowed:boolean = true;

    selectedRooms.forEach(room => totalCapacity += room.capacity);
    selectedClasses.forEach(class_ => totalSize += class_.size);
    if (totalSize > totalCapacity){
      message = "Total capacity exceeded by " + (totalSize-totalCapacity);
      isAllowed=false;
    }
    return {
      message: message,
      isAllowed: isAllowed,
    }
  }


}
