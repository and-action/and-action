import { Component, inject } from '@angular/core';
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
  private dialog = inject(MatDialog);

  protected onAddButtonClick() {
    this.dialog.open(AddRepositoryModalComponent).afterClosed().subscribe();
  }
}
