import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToolbarComponent} from '../../../general/toolbar/toolbar.component';
import {DateService} from '../../../services/date.service';

@Component({
  selector: 'app-secretary-schedule',
  standalone: true,
  imports: [
    ToolbarComponent
  ],
  templateUrl: './secretary-schedule.component.html',
  styleUrl: './secretary-schedule.component.css'
})
export class SecretaryScheduleComponent implements OnInit{
  classId: string = "";
  screen: string = "";
  selectedWeekDays: Date[] = [];
  selectedDay: Date = new Date();

  constructor(private route:ActivatedRoute, private dateService:DateService) {
    this.selectedWeekDays = dateService.initializeWeekDays();
  }

  ngOnInit():void{
    this.route.paramMap.subscribe((params) => {
      this.classId = params.get("classId") || "";
      this.loadLecturerSchedule();
    })
  }

  loadLecturerSchedule() {
    this.screen = "Schedule loaded for " + this.classId;
  }

  onWeekDaysSelected(weekDays: Date[]):void{
    this.selectedWeekDays = weekDays;
  }

  onDaySelected(day: Date):void{
    this.selectedDay = day;
  }
}
