import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePersonalAppointmentModalComponent } from './update-personal-appointment-modal.component';

describe('CreateAppointmentModalComponent', () => {
  let component: UpdatePersonalAppointmentModalComponent;
  let fixture: ComponentFixture<UpdatePersonalAppointmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePersonalAppointmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePersonalAppointmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
