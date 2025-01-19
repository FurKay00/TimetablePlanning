import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-secretary-schedule',
  standalone: true,
  imports: [],
  templateUrl: './secretary-schedule.component.html',
  styleUrl: './secretary-schedule.component.css'
})
export class SecretaryScheduleComponent implements OnInit{
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

  loadLecturerSchedule() {
    this.screen = "Schedule loaded for " + this.classId;
  }
}
