import { Component, computed, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { Repository } from '../../core/repository';
import { AddRepositoryService } from '../add-repository.service';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from '../../tooltip.directive';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export interface DialogData {
  repositories: Repository[];
}

@Component({
  selector: 'ana-add-repository-modal',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    TooltipDirective,
    MatProgressSpinner,
  ],
  templateUrl: './add-repository-modal.component.html',
  styleUrl: './add-repository-modal.component.scss',
})
export class AddRepositoryModalComponent {
  protected readonly repositories = inject(AddRepositoryService).repositories;
  protected readonly repositoriesWithoutIgnored = computed(() =>
    this.repositories().value.filter(
      (repository) =>
        !this.dialogData.ignoredRepositoriesNameWithOwner.includes(
          repository.nameWithOwner,
        ),
    ),
  );
  protected readonly filter = signal<string>('');
  protected readonly filteredRepositories = computed(() =>
    this.repositoriesWithoutIgnored().filter((repository) =>
      repository.nameWithOwner.includes(this.filter()),
    ),
  );
  protected selectedRepositories: string[] = [];

  private readonly dialogRef = inject(
    MatDialogRef<AddRepositoryModalComponent>,
  );
  private readonly dialogData = inject(MAT_DIALOG_DATA);

  protected checkboxClick(
    nameWithOwner: string,
    checkboxChange: MatCheckboxChange,
  ) {
    if (checkboxChange.checked) {
      this.selectedRepositories.push(nameWithOwner);
    } else {
      this.selectedRepositories = this.selectedRepositories.filter(
        (current) => current != nameWithOwner,
      );
    }
  }

  protected onAddClick() {
    this.dialogRef.close(this.selectedRepositories);
  }
}
