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

  dynamicHeader:string = "";
  staticLinks = [
    { path: '/schedule-per-room', label: 'Classroom Schedules', icon: 'home', description: 'Classroom Schedule', roles: ['Student', 'Lecturer', 'Secretary'] },
    { path: '/schedule-per-lecturer', label: 'Teacher Schedules', icon: 'person', description: 'Teacher Schedule', roles: ['Student', 'Lecturer', 'Secretary'] }
  ]
  dynamicLinks:any = [];
  filteredLinks:any = []

  constructor(private roleService:RoleService) {
    this.dynamicLinks = [
      { path: `/student-schedule/${this.roleService.getId()}`, label: this.roleService.getClass(), icon: 'calendar_today', description: 'Schedule from', roles: ['Student'] },
      { path: `/lecturer-schedule/${this.roleService.getId()}`, label: 'My Schedule', icon: 'calendar_today', description: 'Schedule for', roles: ['Lecturer'] },
    ];
  }

  ngOnInit() {
    this.dynamicHeader = this.roleService.getDynamicHeader();
    const userRole = this.roleService.getUserRole();
    if (userRole === 'Secretary'){
      this.dynamicLinks = this.roleService.getSecretaryClasses().map((classItem) => ({
        path: classItem.path,
        label: classItem.label,
        icon: classItem.icon,
        roles: ['Secretary'],
      }));
    }
    this.filteredLinks = [...this.dynamicLinks].filter((link) => link.roles.includes(userRole));
    console.log(userRole);
    console.log(this.filteredLinks)
  }
}
