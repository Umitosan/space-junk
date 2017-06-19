import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { D3mainComponent } from './d3main.component';

describe('D3mainComponent', () => {
  let component: D3mainComponent;
  let fixture: ComponentFixture<D3mainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ D3mainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(D3mainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
