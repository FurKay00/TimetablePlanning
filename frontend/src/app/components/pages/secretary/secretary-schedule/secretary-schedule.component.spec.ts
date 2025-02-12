import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryScheduleComponent } from './secretary-schedule.component';

describe('SecretaryScheduleComponent', () => {
  let component: SecretaryScheduleComponent;
  let fixture: ComponentFixture<SecretaryScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretaryScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretaryScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
