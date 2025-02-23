import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAppointmentModalComponent } from './update-appointment-modal.component';

describe('CreateAppointmentModalComponent', () => {
  let component: UpdateAppointmentModalComponent;
  let fixture: ComponentFixture<UpdateAppointmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAppointmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateAppointmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
