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
import {DateService} from '../../services/date.service';

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
  @Output() selectedDay = new EventEmitter<Date>();

  showDistance = false;
  viewMode: 'day' | 'week' = 'week';
  startOfWeek!: Date;
  endOfWeek!: Date;
  currentDate:Date = new Date();

  constructor(private dateService:DateService) {
    this.resetToCurrentWeek();
  }

  setViewMode(mode: 'day' | 'week'): void {
    this.viewMode = mode;
  }

  onDateSelected(selectedDate: Date): void {
    this.startOfWeek = this.dateService.calculateStartOfWeek(selectedDate); // Week starts on Monday
    this.endOfWeek =this.dateService.calculateEndOfWeek(selectedDate);
    this.currentDate = selectedDate;
    this.selectedDay.emit(this.currentDate);
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
    this.startOfWeek = this.dateService.calculateStartOfWeek(today);
    this.endOfWeek = this.dateService.calculateEndOfWeek(today);

    this.emitWeekDays();
  }

  emitWeekDays(): void {
    const weekDays = this.dateService.calculateWeekDays(this.startOfWeek, this.endOfWeek);
    this.weekDaysSelected.emit(weekDays);
  }
}
