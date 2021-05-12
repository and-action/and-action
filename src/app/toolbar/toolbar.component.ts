import { Component } from '@angular/core';
import { AppRouting } from '../app-routing';

@Component({
  selector: 'ana-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  appRouting = AppRouting;
}
