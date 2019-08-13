import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEncryptPostComponent } from './confirm-encrypt-post.component';

describe('ConfirmEncryptPostComponent', () => {
  let component: ConfirmEncryptPostComponent;
  let fixture: ComponentFixture<ConfirmEncryptPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmEncryptPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEncryptPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
