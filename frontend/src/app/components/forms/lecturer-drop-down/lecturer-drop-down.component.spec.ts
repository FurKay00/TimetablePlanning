import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerDropDownComponent } from './lecturer-drop-down.component';

describe('LecturerDropDownComponent', () => {
  let component: LecturerDropDownComponent;
  let fixture: ComponentFixture<LecturerDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerDropDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LecturerDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
