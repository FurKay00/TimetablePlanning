import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {addDays, addWeeks, subDays, subWeeks} from 'date-fns';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DatePipe, formatDate, NgIf} from '@angular/common';
import {DateService} from '../../../services/date.service';
import {CalendarView} from 'angular-calendar';
import {LecturerDropDownComponent} from '../../forms/lecturer-drop-down/lecturer-drop-down.component';
import {RoomDropDownComponent} from '../../forms/room-drop-down/room-drop-down.component';
import {LecturerView, RoomView} from '../../../models/response_models';

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
    MatInput,
    DatePipe,
    NgIf,
    LecturerDropDownComponent,
    RoomDropDownComponent
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Output() weekDaysSelected  = new EventEmitter<Date[]>();
  @Output() selectedDay = new EventEmitter<Date>();
  @Output() selectedView = new EventEmitter<CalendarView>();
  @Output() selectedLecturer = new EventEmitter<LecturerView>();
  @Output() selectedRoom = new EventEmitter<RoomView>();
  @Output() createModalOpened = new EventEmitter<void>();
  @Output() editModalOpened = new EventEmitter<void>();

  @Input() showCreateField:boolean = false;
  @Input() showEditField:boolean = false;
  @Input() showRoomSelect:boolean = false;
  @Input() showLecturerSelect:boolean = false;
  @Input() lecturerOptions: LecturerView[] = [];
  @Input() roomOptions: RoomView[] = [];
  @Input() currentDate:Date = new Date();

  showDistance = false;
  viewMode: 'day' | 'week' = 'week';
  startOfWeek!: Date;
  endOfWeek!: Date;

  currentDateSelected:Boolean =true;

  constructor(private dateService:DateService) {
    this.resetToCurrentWeek();
  }

  setViewMode(mode: 'day' | 'week'): void {
    this.viewMode = mode;
    if(mode === 'day'){
      this.selectedView.emit(CalendarView.Day)
    }else{
      this.selectedView.emit(CalendarView.Week)
    }
  }

  onDateSelected(selectedDate: Date): void {
    this.startOfWeek = this.dateService.calculateStartOfWeek(selectedDate); // Week starts on Monday
    this.endOfWeek =this.dateService.calculateEndOfWeek(selectedDate);
    this.currentDate = selectedDate;
    this.currentDateSelected =  formatDate( this.currentDate, 'dd/MM/yyyy',  'en-US') === formatDate( new Date(), 'dd/MM/yyyy',  'en-US');
    console.log(this.currentDateSelected);
    this.selectedDay.emit(this.currentDate);
    this.emitWeekDays();
  }

  setToNextWeek():void{
    if(this.viewMode === "week"){
      this.onDateSelected( addWeeks(this.currentDate, 1));
    }else{
      this.onDateSelected(addDays(this.currentDate, 1));
    }
  }

  setToLastWeek():void{
    if(this.viewMode === "week"){
      this.onDateSelected( subWeeks(this.currentDate, 1));
    }else{
      this.onDateSelected(subDays(this.currentDate, 1));
    }
  }

  resetToCurrentWeek(): void {
    const today = new Date();
    this.currentDate = today;
    this.selectedDay.emit(today);
    this.startOfWeek = this.dateService.calculateStartOfWeek(today);
    this.endOfWeek = this.dateService.calculateEndOfWeek(today);
    this.currentDateSelected =  formatDate( this.currentDate, 'dd/MM/yyyy',  'en-US') === formatDate( new Date(), 'dd/MM/yyyy',  'en-US');
    console.log(this.currentDateSelected);

    this.emitWeekDays();
  }

  emitWeekDays(): void {
    const weekDays = this.dateService.calculateWeekDays(this.startOfWeek, this.endOfWeek);
    this.weekDaysSelected.emit(weekDays);
  }

  emitSelectedRoom(room: RoomView):void{
    this.selectedRoom.emit(room);
  }

  emitSelectedLecturer(lecturer: LecturerView):void{
    this.selectedLecturer.emit(lecturer)
  }

  triggerCreateModalWindow(){
    this.createModalOpened.emit();
  }

  triggerEditModalWindow(){
    this.editModalOpened.emit();
  }
}
