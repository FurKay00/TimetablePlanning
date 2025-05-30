import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RoleService} from '../../../services/role.service';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    NgForOf,
    MatIcon,
    NgIf,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit,OnChanges{
  @Input() changeProfile:boolean = false;

  dynamicHeader:string = "";
  staticLinks = [
    { path: '/schedule-per-room', label: 'Classroom', icon: 'home', description: 'Classroom', roles: ['STUDENT', 'LECTURER', 'SECRETARY'] },
    { path: '/schedule-per-lecturer', label: 'Lecturer', icon: 'person', description: 'Teacher', roles: ['STUDENT', 'LECTURER', 'SECRETARY'] }
  ]
  dynamicLinks:any = [];
  filteredLinks:any = []

  constructor(private roleService:RoleService) {
    this.uploadDynamicHeader();
  }

  ngOnInit() {
    this.uploadDynamicHeader();
  }

  ngOnChanges(changes:SimpleChanges){
      this.uploadDynamicHeader();
  }

  uploadDynamicHeader():void{
    this.dynamicLinks = [
      { path: `/student-schedule/${this.roleService.getClass()}`, label: this.roleService.getClass(), icon: 'calendar_today', description: 'Schedule from', roles: ['STUDENT'] },
      { path: `/lecturer-schedule/${this.roleService.getId()}`, label: this.roleService.getUsername(), icon: 'calendar_today', description: 'Schedule for', roles: ['LECTURER'] },
    ];
    this.dynamicHeader = this.roleService.getDynamicHeader();
    const userRole = this.roleService.getUserRole();
    if (userRole === 'SECRETARY'){
      this.dynamicLinks = this.roleService.getSecretaryClasses().map((classItem) => ({
        path: classItem.path,
        label: classItem.label,
        icon: classItem.icon,
        roles: ['SECRETARY'],
      }));
    }
    this.filteredLinks = [...this.dynamicLinks].filter((link) => link.roles.includes(userRole));
    console.log(userRole);
    console.log(this.filteredLinks)
  }
}
