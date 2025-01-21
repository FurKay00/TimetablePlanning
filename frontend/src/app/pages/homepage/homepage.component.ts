import { Component } from '@angular/core';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    ToolbarComponent
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {

}
