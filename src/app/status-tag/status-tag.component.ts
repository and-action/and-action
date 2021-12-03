import { Component, Input } from '@angular/core';
import { StatusTagColor } from './status-tag-color';
import { StatusTagStatus } from './status-tag-status';

@Component({
  selector: 'ana-status-tag',
  templateUrl: './status-tag.component.html',
  styleUrls: ['./status-tag.component.scss'],
})
export class StatusTagComponent {
  @Input() name?: string;
  @Input() color?: StatusTagColor;
  @Input() status?: StatusTagStatus;
  @Input() link?: string;

  statusTagStatus = StatusTagStatus;
}
