import {Component, Input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {ProfileInfo} from '../../models/ProfileInfo';
import {RoleService} from '../../services/role.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    NgForOf,
    MatIcon,
    NgIf,
    RouterLink
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit{

  navigationLinks = [
      { path: '/student-schedule', label: 'My Schedule', icon: 'schedule', description: 'Schedule from', roles: ['Student'] },
      { path: '/lecturer-schedule', label: 'My Schedule', icon: 'calendar_today', description: 'Schedule for', roles: ['Lecturer'] },
      { path: '/schedule-per-room', label: 'Classroom Schedules', icon: 'home', description: 'Classroom Schedule', roles: ['Student', 'Lecturer', 'Secretary'] },
      { path: '/schedule-per-lecturer', label: 'Teacher Schedules', icon: 'person', description: 'Teacher Schedule', roles: ['Student', 'Lecturer', 'Secretary'] },
    ];
  dynamicLinks:any = [];
  filteredLinks:any = []

  constructor(private roleService:RoleService) {
  }

  ngOnInit() {
    const userRole = this.roleService.getUserRole();
    if (userRole === 'Secretary'){
      this.dynamicLinks = this.roleService.getSecretaryClasses().map((classItem) => ({
        path: classItem.path,
        label: classItem.label,
        icon: classItem.icon,
        roles: ['Secretary'],
      }));
    }
    this.filteredLinks = [...this.navigationLinks, ...this.dynamicLinks].filter((link) => link.roles.includes(userRole));
    console.log(userRole);
    console.log(this.filteredLinks)
  }

  /*
  @Input() currentRole:ProfileInfo = {
    name: "John Secretary",
    role: "Secretary",
    faculty: "Technology",
    imgUrl: "/images/secretary_image.png",
    classes: ['Class 1', 'Class 2', 'Class N']
  }; */


}
