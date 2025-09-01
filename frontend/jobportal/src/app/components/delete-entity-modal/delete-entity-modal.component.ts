import { Component, inject } from '@angular/core';
import { DeleteEntityService } from '../../services/delete-entity.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delete-entity-modal',
  imports: [TranslateModule],
  templateUrl: './delete-entity-modal.component.html',
  styleUrls: ['./delete-entity-modal.component.css'],
})
export class DeleteEntityModalComponent {
  deleteService = inject(DeleteEntityService);

  confirmDelete() {
    this.deleteService.confirmDelete();
  }
}
