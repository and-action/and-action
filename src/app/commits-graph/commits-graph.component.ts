import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  Commit,
  CommitWithIndentationLevel,
} from '../commits-dashboard/commits-dashboard-models';
import { BehaviorSubject } from 'rxjs';
import { CommitsGraphService } from './commits-graph.service';

@Component({
  selector: 'ana-commits-graph',
  templateUrl: './commits-graph.component.html',
  styleUrls: ['./commits-graph.component.scss'],
})
export class CommitsGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('graphContainer') private graphContainer: ElementRef;
  // TODO: Check why subject is needed. I would prefer calling drawGraph immediately.
  @Input()
  set commits(commits: Commit[]) {
    this.commits$.next(commits);
  }

  private commits$ = new BehaviorSubject<Commit[] | undefined>(undefined);

  constructor(private commitsGraphService: CommitsGraphService) {}

  ngAfterViewInit() {
    this.commits$.subscribe((commits) => this.drawGraph(commits));
  }

  ngOnDestroy() {
    this.commits$.unsubscribe();
  }

  private drawGraph(commits: Commit[]) {
    const svg = this.commitsGraphService.createCommitsGraphSvg(commits);
    this.graphContainer.nativeElement.appendChild(svg.node());
  }
}
