import { Routes } from '@angular/router';
import {SecretaryScheduleComponent} from './pages/secretary/secretary-schedule/secretary-schedule.component';
import {StudentScheduleComponent} from './pages/student/student-schedule/student-schedule.component';
import {LecturerScheduleComponent} from './pages/lecturer/lecturer-schedule/lecturer-schedule.component';
import {SchedulePerLecturerComponent} from './pages/shared/schedule-per-lecturer/schedule-per-lecturer.component';
import {SchedulePerRoomComponent} from './pages/shared/schedule-per-room/schedule-per-room.component';
import {HomepageComponent} from './pages/homepage/homepage.component';

export const routes: Routes = [
  {path: 'homepage', component: HomepageComponent},
  {path: '', redirectTo: 'homepage', pathMatch: "full"},
  {path: 'student-schedule/:classId', component: StudentScheduleComponent},
  {path: 'lecturer-schedule/:lecturerId', component: LecturerScheduleComponent},
  {path: 'secretary-schedule/:classId', component: SecretaryScheduleComponent},
  {path: 'schedule-per-lecturer', component: SchedulePerLecturerComponent},
  {path: 'schedule-per-room', component: SchedulePerRoomComponent},
];
