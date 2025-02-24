import { Component } from '@angular/core';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {ScheduleComponent} from '../../timetable/schedule/schedule.component';
import {ActivatedRoute} from '@angular/router';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    ToolbarComponent,
    ScheduleComponent,
    MatCardContent,
    MatCard,
    MatCardHeader,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatCardSubtitle,
    MatCardTitle
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {

  constructor(private route:ActivatedRoute) {
  }

}
