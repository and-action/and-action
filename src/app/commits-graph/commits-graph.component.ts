import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { Commit } from '../commits-dashboard/commits-dashboard-models';
import { CommitsGraphService } from './commits-graph.service';

@Component({
  standalone: true,
  selector: 'ana-commits-graph',
  templateUrl: './commits-graph.component.html',
  styleUrl: './commits-graph.component.scss',
})
export class CommitsGraphComponent implements AfterViewInit {
  private graphContainer = viewChild.required<ElementRef>('graphContainer');

  private commitsGraphService = inject(CommitsGraphService);

  // TODO: Check why subject is needed. I would prefer calling drawGraph immediately.
  commits = input.required<Commit[]>();

  constructor() {
    effect(() => this.drawGraph(this.commits()));
  }

  ngAfterViewInit() {
    this.drawGraph(this.commits());
  }

  private drawGraph(commits: Commit[]) {
    const svg = this.commitsGraphService.createCommitsGraphSvg(commits);
    this.graphContainer().nativeElement.replaceChildren(svg.node());
  }
}
