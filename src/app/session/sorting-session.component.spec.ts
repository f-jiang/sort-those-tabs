import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingSessionComponent } from './sorting-session.component';

describe('SortingSessionComponent', () => {
  let component: SortingSessionComponent;
  let fixture: ComponentFixture<SortingSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SortingSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortingSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
