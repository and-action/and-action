import { Component, OnInit } from '@angular/core';
import { AppRouting } from '../app-routing';

@Component({
  selector: 'app-actions-dashboard',
  templateUrl: './actions-dashboard.component.html',
  styleUrls: ['./actions-dashboard.component.scss']
})
export class ActionsDashboardComponent implements OnInit {
  appRouting = AppRouting;
  constructor() {}

  ngOnInit(): void {}
}
