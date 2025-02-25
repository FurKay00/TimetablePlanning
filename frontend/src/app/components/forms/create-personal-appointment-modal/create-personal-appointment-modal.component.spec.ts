import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePersonalAppointmentModalComponent } from './create-personal-appointment-modal.component';

// @ts-ignore
describe('CreateAppointmentModalComponent', () => {
  let component: CreatePersonalAppointmentModalComponent;
  let fixture: ComponentFixture<CreatePersonalAppointmentModalComponent>;

  // @ts-ignore
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePersonalAppointmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePersonalAppointmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // @ts-ignore
  it('should create', () => {
    // @ts-ignore
    expect(component).toBeTruthy();
  });
});
