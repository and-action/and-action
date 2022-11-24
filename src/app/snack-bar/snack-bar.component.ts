import { Component, Inject } from '@angular/core';
import {
  MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA,
  MatLegacySnackBarRef as MatSnackBarRef,
} from '@angular/material/legacy-snack-bar';
import { SnackBarData } from './snack-bar-data';
import { SnackBarType } from './snack-bar-type';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@Component({
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  selector: 'ana-snack-bar',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.scss'],
})
export class SnackBarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData,
    private matSnackBarRef: MatSnackBarRef<SnackBarComponent>
  ) {}

  dismiss() {
    this.matSnackBarRef.dismiss();
  }

  getIcon(type: SnackBarType) {
    return type === SnackBarType.ERROR ? 'error' : 'info';
  }

  getIconColor(type: SnackBarType) {
    return type === SnackBarType.ERROR ? 'warn' : 'primary';
  }
}
