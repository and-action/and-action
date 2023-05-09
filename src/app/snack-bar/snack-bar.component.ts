import { Component, inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { SnackBarData } from './snack-bar-data';
import { SnackBarType } from './snack-bar-type';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  selector: 'ana-snack-bar',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.scss'],
})
export class SnackBarComponent {
  public data = inject<SnackBarData>(MAT_SNACK_BAR_DATA);
  private matSnackBarRef = inject(MatSnackBarRef<SnackBarComponent>);

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
