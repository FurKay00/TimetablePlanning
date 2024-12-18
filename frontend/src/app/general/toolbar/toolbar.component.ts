import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    MatIconButton,
    MatCheckbox,
    MatButton
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  showDistance = false;
  viewMode: 'day' | 'week' = 'week';

  setViewMode(mode: 'day' | 'week'): void {
    this.viewMode = mode;
  }

  goToday() {
    console.log('Reset to today');
  }

  previous() {
    console.log('Go to previous');
  }

  next() {
    console.log('Go to next');
  }
}
