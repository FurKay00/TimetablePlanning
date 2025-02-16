import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDropDownComponent } from './room-drop-down.component';

describe('RoomDropDownComponent', () => {
  let component: RoomDropDownComponent;
  let fixture: ComponentFixture<RoomDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomDropDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
