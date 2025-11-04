import { Component, input } from '@angular/core';
import { StatusTagColor } from './status-tag-color';
import { StatusTagStatus } from './status-tag-status';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'ana-status-tag',
  templateUrl: './status-tag.component.html',
  styleUrl: './status-tag.component.scss',
})
export class StatusTagComponent {
  name = input.required<string>();
  color = input.required<StatusTagColor>();
  status = input.required<StatusTagStatus>();
  link = input.required<string | null>();

  protected statusTagStatus = StatusTagStatus;
}
