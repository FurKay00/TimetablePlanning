import { Injectable } from '@angular/core';
import {eachDayOfInterval, endOfWeek, startOfWeek} from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  currentDate:Date = new Date();

  constructor() { }

  calculateStartOfWeek(date:Date):Date{
    return startOfWeek(date, { weekStartsOn: 1 });
  }

  calculateEndOfWeek(date:Date):Date{
    return endOfWeek(date, { weekStartsOn: 1 });
  }

  calculateWeekDays(startOfWeek:Date, endOfWeek:Date){
    return  eachDayOfInterval({
      start: startOfWeek,
      end: endOfWeek,
    });
  }
  initializeWeekDays(){
    return this.calculateWeekDays(this.calculateStartOfWeek(this.currentDate), this.calculateEndOfWeek(this.currentDate));
  }
}
