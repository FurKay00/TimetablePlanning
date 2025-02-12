import { Component } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/general/header/header.component';
import {ToolbarComponent} from './components/general/toolbar/toolbar.component';
import {NavigationComponent} from './components/general/navigation/navigation.component';
import {ProfileInfo} from './models/ProfileInfo';
import {ScheduleComponent} from './components/timetable/schedule/schedule.component';
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
  changeProfile = false;

  studentProfile:ProfileInfo = {
    id:"1", class: 'TINF22B6', name: 'John Student', role: 'Student', classes: [], imgUrl: '/images/student_image.png'
  }

  lecturerProfile:ProfileInfo = {
    id:"2", name: 'John Lecturer', role: 'Lecturer', imgUrl: '/images/lecturer_image.png', classes: [], faculty: 'Technology'
  }

  secretaryProfile:ProfileInfo = {
    id:"3", name: 'John Secretary', role: 'Secretary', imgUrl: '/images/secretary_image.png', classes: ['TINF22B6', 'TINF22B5', 'TINF22B4'], faculty: 'Technology'
  }

  currentProfile:ProfileInfo = this.secretaryProfile;
  //currentProfile:ProfileInfo = this.studentProfile;
  //currentProfile:ProfileInfo = this.lecturerProfile;

  constructor(private roleService:RoleService, private router:Router) {
    roleService.setCurrentProfile(this.currentProfile)
    roleService.setRole(this.currentProfile.role)
  }

  setSecretaryView(){
    this.currentProfile = this.secretaryProfile;
    this.updateCurrentRole();
  }

  setLecturerView(){
    this.currentProfile = this.lecturerProfile;
    this.updateCurrentRole();
  }

  setStudentView(){
    this.currentProfile = this.studentProfile;
    this.updateCurrentRole();
  }

  private updateCurrentRole() {
    this.changeProfile = !this.changeProfile;
    this.roleService.setCurrentProfile(this.currentProfile);
    this.roleService.setRole(this.currentProfile.role);
    this.router.navigate(["/homepage"])
  }
}
