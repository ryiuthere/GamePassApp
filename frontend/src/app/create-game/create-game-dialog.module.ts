import { NgModule } from '@angular/core';
import { CreateGameDialogComponent } from './create-game-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [CreateGameDialogComponent],
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        CommonModule,
    ],
    providers: [MatDatepickerModule],
})
export class CreateGameDialogModule {}
