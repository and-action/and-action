import { Component, Input } from '@angular/core';
import { StatusWithTextStatus } from '../core/status-with-text';

@Component({
  selector: 'ana-status-with-text',
  imports: [],
  templateUrl: './status-with-text.component.html',
  styleUrl: './status-with-text.component.scss',
})
export class StatusWithTextComponent {
  @Input({ required: true }) status?: StatusWithTextStatus;
  @Input({ required: true }) text?: string;
  @Input({ required: true }) link?: string;

  protected readonly statusWithTextStatus = StatusWithTextStatus;
}
