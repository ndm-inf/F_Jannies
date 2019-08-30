import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeratorDialogComponent } from './moderator-dialog.component';

describe('ModeratorDialogComponent', () => {
  let component: ModeratorDialogComponent;
  let fixture: ComponentFixture<ModeratorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModeratorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeratorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
