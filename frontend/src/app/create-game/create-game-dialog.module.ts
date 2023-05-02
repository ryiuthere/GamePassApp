import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateGameDialogComponent } from './create-game-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [CreateGameDialogComponent],
    imports: [MatDialogModule, MatButtonModule],
})
export class CreateGameDialogModule {}
