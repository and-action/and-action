import { Component, input } from '@angular/core';
import { StatusWithTextStatus } from '../core/status-with-text';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ana-status-with-text',
  imports: [NgTemplateOutlet],
  templateUrl: './status-with-text.component.html',
  styleUrl: './status-with-text.component.scss',
})
export class StatusWithTextComponent {
  status = input.required<StatusWithTextStatus>();
  text = input.required<string>();
  link = input<string>();

  protected readonly statusWithTextStatus = StatusWithTextStatus;
}
