import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Commit } from '../commits-dashboard/commits-dashboard-models';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CommitsGraphService } from './commits-graph.service';

@Component({
  selector: 'ana-commits-graph',
  templateUrl: './commits-graph.component.html',
  styleUrls: ['./commits-graph.component.scss'],
})
export class CommitsGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('graphContainer') private graphContainer?: ElementRef;

  private commits$ = new BehaviorSubject<Commit[]>([]);
  private commitsSubscription?: Subscription;

  constructor(private commitsGraphService: CommitsGraphService) {}

  // TODO: Check why subject is needed. I would prefer calling drawGraph immediately.
  @Input()
  set commits(commits: Commit[]) {
    this.commits$.next(commits);
  }

  ngAfterViewInit() {
    this.commitsSubscription = this.commits$.subscribe((commits) =>
      this.drawGraph(commits)
    );
  }

  ngOnDestroy() {
    this.commitsSubscription?.unsubscribe();
  }

  private drawGraph(commits: Commit[]) {
    const svg = this.commitsGraphService.createCommitsGraphSvg(commits);
    this.graphContainer?.nativeElement.appendChild(svg.node());
  }
}
