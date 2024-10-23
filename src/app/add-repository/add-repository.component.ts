import { Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AddRepositoryModalComponent } from './add-repository-modal/add-repository-modal.component';

@Component({
  selector: 'ana-add-repository',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './add-repository.component.html',
})
export class AddRepositoryComponent {
  addRepositories = output<string[]>();
  private dialog = inject(MatDialog);

  protected onAddButtonClick() {
    this.dialog
      .open(AddRepositoryModalComponent, {
        height: '80vh',
        width: '560px',
        maxWidth: '100vw',
      })
      .afterClosed()
      .subscribe((repositoriesToAdd) => {
        if (repositoriesToAdd) {
          this.addRepositories.emit(repositoriesToAdd);
        }
      });
  }
}
