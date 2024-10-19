import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Repository } from '../../core/repository';
import { AddRepositoryService } from '../add-repository.service';
import { MatInputModule } from '@angular/material/input';

export interface DialogData {
  repositories: Repository[];
}

@Component({
  selector: 'ana-add-repository-modal',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
  ],
  templateUrl: './add-repository-modal.component.html',
  styleUrl: './add-repository-modal.component.scss',
})
export class AddRepositoryModalComponent {
  protected repositories = inject(AddRepositoryService).repositories;

  protected onAddClick() {
    console.log('Add repositories');
  }
}
