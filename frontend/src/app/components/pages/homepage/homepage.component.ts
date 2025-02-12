import { Component } from '@angular/core';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {ScheduleComponent} from '../../timetable/schedule/schedule.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    ToolbarComponent,
    ScheduleComponent
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {

}
