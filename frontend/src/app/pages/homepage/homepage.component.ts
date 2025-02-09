import { Component } from '@angular/core';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {CalendarModule, CalendarWeekModule} from 'angular-calendar';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    ToolbarComponent,
    CalendarWeekModule,
    CalendarModule
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {

}
