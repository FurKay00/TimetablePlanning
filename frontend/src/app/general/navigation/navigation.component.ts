import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {ProfileInfo} from '../../models/ProfileInfo';

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
  @Input() currentRole:ProfileInfo = {
    name: "John Secretary",
    role: "Secretary",
    imgUrl: "/images/secretary_image.png"
  };

  courses = ['Course 1', 'Course 2', 'Course N'];
}
