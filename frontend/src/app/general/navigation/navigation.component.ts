import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    NgForOf,
    MatIcon
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {
  @Input() role = "Student";
  courses = ['Course 1', 'Course 2', 'Course 3'];
}
