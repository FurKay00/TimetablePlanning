import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConflictViewComponent } from './conflict-view.component';

describe('ConflictViewComponent', () => {
  let component: ConflictViewComponent;
  let fixture: ComponentFixture<ConflictViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConflictViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConflictViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
