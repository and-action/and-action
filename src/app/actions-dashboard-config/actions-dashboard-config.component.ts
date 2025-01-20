import { Component, inject } from '@angular/core';
import { AppRouting } from '../app-routing';
import { AndActionDataService } from '../core/and-action-data.service';
import { Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommitsDashboardConfig } from '../core/commits-dashboard-config';

@Component({
  imports: [FormsModule, MatButtonModule, MatInputModule, RouterModule],
  selector: 'ana-actions-dashboard-config',
  templateUrl: './actions-dashboard-config.component.html',
  styleUrl: './actions-dashboard-config.component.scss',
})
export class ActionsDashboardConfigComponent {
  protected appRouting = AppRouting;

  protected commitsHistoryCount =
    inject(AndActionDataService).commitsDashboardConfig?.commitsHistoryCount;

  private readonly andActionDataService = inject(AndActionDataService);
  private readonly router = inject(Router);

  onSave() {
    this.andActionDataService.saveCommitsDashboardConfig(
      new CommitsDashboardConfig(this.commitsHistoryCount),
    );

    this.router.navigate([AppRouting.DASHBOARD]);
  }
}
