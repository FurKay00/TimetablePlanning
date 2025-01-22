import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks} from 'date-fns';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInput, MatInputModule, MatLabel} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    MatIconButton,
    MatCheckbox,
    MatButton,
    MatDatepickerModule,
    MatFormFieldModule,
    DatePipe,
    MatLabel,
    MatInput
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Output() weekDaysSelected  = new EventEmitter<Date[]>();

  showDistance = false;
  viewMode: 'day' | 'week' = 'week';
  startOfWeek!: Date;
  endOfWeek!: Date;
  currentDate:Date = new Date();

  constructor() {
    this.resetToCurrentWeek();
  }

  setViewMode(mode: 'day' | 'week'): void {
    this.viewMode = mode;
  }

  onDateSelected(selectedDate: Date): void {
    this.startOfWeek = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Week starts on Monday
    this.endOfWeek = endOfWeek(selectedDate, { weekStartsOn: 1 });
    this.currentDate = selectedDate;

    this.emitWeekDays();
  }

  setToNextWeek():void{
    this.onDateSelected( addWeeks(this.currentDate, 1));
  }

  setToLastWeek():void{
    this.onDateSelected( subWeeks(this.currentDate, 1));
  }

  resetToCurrentWeek(): void {
    const today = new Date();
    this.currentDate = today;
    this.startOfWeek = startOfWeek(today, { weekStartsOn: 1 });
    this.endOfWeek = endOfWeek(today, { weekStartsOn: 1 });

    this.emitWeekDays();
  }

  emitWeekDays(): void {
    const weekDays = eachDayOfInterval({
      start: this.startOfWeek,
      end: this.endOfWeek,
    });
    this.weekDaysSelected.emit(weekDays);
  }
}
