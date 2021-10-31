import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitsGraphComponent } from './commits-graph.component';
import { CommitsGraphService } from './commits-graph.service';
import * as d3Selection from 'd3-selection';

describe('CommitsGraphComponent', () => {
  let component: CommitsGraphComponent;
  let fixture: ComponentFixture<CommitsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommitsGraphComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    const commitGraphService = TestBed.inject(CommitsGraphService);

    spyOn(commitGraphService, 'createCommitsGraphSvg').and.returnValue(
      d3Selection.create('svg')
    );

    fixture = TestBed.createComponent(CommitsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
