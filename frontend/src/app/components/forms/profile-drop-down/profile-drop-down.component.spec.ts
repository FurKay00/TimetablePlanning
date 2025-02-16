import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDropDownComponent } from './profile-drop-down.component';

describe('ProfileDropDownComponent', () => {
  let component: ProfileDropDownComponent;
  let fixture: ComponentFixture<ProfileDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDropDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
