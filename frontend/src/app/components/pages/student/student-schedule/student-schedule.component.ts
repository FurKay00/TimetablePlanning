import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [],
  templateUrl: './student-schedule.component.html',
  styleUrl: './student-schedule.component.css'
})
export class StudentScheduleComponent implements OnInit{
  classId: string = "";
  screen: string = "";
  constructor(private route:ActivatedRoute) {
  }

  ngOnInit():void{
    this.route.paramMap.subscribe((params) => {
      this.classId = params.get("classId") || "";
      this.loadLecturerSchedule();
    })
  }

  loadLecturerSchedule(){
    this.screen = "Schedule loaded for " + this.classId;

  }
}
