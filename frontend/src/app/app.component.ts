import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from './general/header/header.component';
import {ToolbarComponent} from './general/toolbar/toolbar.component';
import {NavigationComponent} from './general/navigation/navigation.component';
import {ProfileInfo} from './models/ProfileInfo';
import {ScheduleComponent} from './timetable/schedule/schedule.component';
import {RoleService} from './services/role.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToolbarComponent, NavigationComponent, ScheduleComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TimetablePlanning';

  constructor(roleService:RoleService) {
    roleService.setRole(this.currentProfile.role)
  }
  studentProfile:ProfileInfo = {
    class: 'TINF22B6', name: 'John Student', role: 'Student', classes: [], imgUrl: '/images/student_image.png'
  }

  lecturerProfile:ProfileInfo = {
    name: 'John Lecturer', role: 'Lecturer', imgUrl: '/images/lecturer_image.png', classes: [], faculty: 'Technology'
  }

  secretaryProfile:ProfileInfo = {
    name: 'John Secretary', role: 'Secretary', imgUrl: '/images/secretary_image.png', classes: ['Class 1', 'Class 2', 'Class N'], faculty: 'Technology'
  }

  currentProfile:ProfileInfo = this.secretaryProfile;
  //currentProfile:ProfileInfo = this.studentProfile;
  //currentProfile:ProfileInfo = this.lecturerProfile;
}
