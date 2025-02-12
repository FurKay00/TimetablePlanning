import { Component, Input } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [
    MatIcon,
    NgOptimizedImage,
    RouterLink
  ],
  standalone: true
})
export class HeaderComponent {
  @Input() name = "Standardname";
  @Input() role = "Student";
  @Input() imgUrl = "public/secretary_image.png";
}
