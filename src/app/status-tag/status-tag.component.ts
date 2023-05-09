import { Component, Input } from '@angular/core';
import { StatusTagColor } from './status-tag-color';
import { StatusTagStatus } from './status-tag-status';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ana-status-tag',
  templateUrl: './status-tag.component.html',
  styleUrls: ['./status-tag.component.scss'],
})
export class StatusTagComponent {
  @Input({ required: true }) name?: string;
  @Input({ required: true }) color?: StatusTagColor;
  @Input({ required: true }) status?: StatusTagStatus;
  @Input({ required: true }) link?: string | null;

  protected statusTagStatus = StatusTagStatus;
}
