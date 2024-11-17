import { Component, Input } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [
    MatIcon,
    NgOptimizedImage
  ],
  standalone: true
})
export class HeaderComponent {
  @Input() name = "Standardname";
  @Input() role = "Student";
  @Input() imgUrl = "public/secretary_image.png";
}
