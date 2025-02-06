import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { NgClass } from '@angular/common';

export interface ConfirmationDialogData {
  title: string;
  text: string;
  confirmButtonLabel?: string;
  isWarning: boolean;
}

@Component({
  selector: 'ana-confirmation-dialog',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    NgClass,
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  protected readonly dialogData: ConfirmationDialogData =
    inject(MAT_DIALOG_DATA);
}
