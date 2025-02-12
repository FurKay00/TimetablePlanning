import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-lecturer-schedule',
  standalone: true,
  imports: [],
  templateUrl: './lecturer-schedule.component.html',
  styleUrl: './lecturer-schedule.component.css'
})
export class LecturerScheduleComponent implements OnInit{
  lecturerId: string = "";
  screen: string = "";
  constructor(private route:ActivatedRoute) {
  }

  ngOnInit():void{
    this.route.paramMap.subscribe((params) => {
      this.lecturerId = params.get("lecturerId") || "";
      this.loadLecturerSchedule();
    })
  }

  loadLecturerSchedule(){
    this.screen = "Schedule loaded for " + this.lecturerId;

  }
}
