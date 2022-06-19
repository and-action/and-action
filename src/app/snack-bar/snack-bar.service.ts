import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from './snack-bar.component';
import { SnackBarType } from './snack-bar-type';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  constructor(private snackBar: MatSnackBar) {}

  info(message: string) {
    this.openSnackBar(message, SnackBarType.INFO);
  }

  error(message: string) {
    this.openSnackBar(message, SnackBarType.ERROR);
  }

  private openSnackBar(message: string, type: SnackBarType) {
    this.snackBar.openFromComponent(SnackBarComponent, {
      duration: type === SnackBarType.ERROR ? undefined : 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      data: {
        message,
        type,
      },
    });
  }
}
