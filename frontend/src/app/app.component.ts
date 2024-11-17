import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from './general/header/header.component';
import {ToolbarComponent} from './general/toolbar/toolbar.component';
import {NavigationComponent} from './general/navigation/navigation.component';
import {ProfileInfo} from './models/ProfileInfo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToolbarComponent, NavigationComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TimetablePlanning';

  studentRole:ProfileInfo = {
    course: 'TINF22B6', name: 'John Student', role: 'Student', imgUrl: '/images/student_image.png'
  }

  lecturerRole:ProfileInfo = {
    name: 'John Lecturer', role: 'Lecturer', imgUrl: '/images/lecturer_image.png', faculty: 'Technology'
  }

  secretaryRole:ProfileInfo = {
    name: 'John Secretary', role: 'Secretary', imgUrl: '/images/secretary_image.png'
  }

  currentRole:ProfileInfo = this.secretaryRole;
  //currentRole:ProfileInfo = this.studentRole;
  //currentRole:ProfileInfo = this.lecturerRole;
}
