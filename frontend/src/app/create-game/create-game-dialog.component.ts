import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Game } from '../gamedata/gamedata.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeWhile } from 'rxjs';
import { MatChipSelectionChange } from '@angular/material/chips';

@Component({
    selector: 'create-game-dialog',
    templateUrl: './create-game-dialog.component.html',
    styleUrls: ['./create-game-dialog.component.scss'],
})
export class CreateGameDialogComponent {
    modifyingGame = true;
    game: Game;
    dialogDataForm: FormGroup;
    playerInfo: FormControl[];
    gameDataTags = new Map<string, boolean>();
    genres = [
        'Indie',
        'Strategy',
        'Shooter',
        'Sports',
        'Action & Adventure',
        'Platformer',
        'Puzzle',
        'Role Playing',
    ];
    genre: string;
    constructor(private dialog: MatDialogRef<CreateGameDialogComponent>) {
        this.game = {
            id: '',
            data: {
                name: '',
                desc: '',
                releaseDate: '',
                seriesx: false,
                xbone: false,
                windows: false,
                cloud: false,
                genre: '',
                crossplatMultiplayer: false,
                crossplatCoop: false,
                favorite: false,
            },
            playerInfo: [],
        };
        this.dialogDataForm = new FormGroup({
            id: new FormControl(this.game.id, [Validators.required]),
            title: new FormControl(this.game.data.name, [Validators.required]),
            description: new FormControl(this.game.data.desc),
            releaseDate: new FormControl(Date, [Validators.required]),
            genre: new FormControl(this.game.data.genre, [Validators.required]),
        });
        this.playerInfo = [];
        this.dialogDataForm.valueChanges
            .pipe(takeWhile(() => this.modifyingGame))
            .subscribe((data) => this.onDialogChange(data));
        this.genre = '';
    }

    private onDialogChange(data: any) {
        this.game.id = data.id;
        this.game.data.name = data.title;
        this.game.data.desc = data.description;
        if (data.releaseDate instanceof Date) {
            this.game.data.releaseDate = data.releaseDate
                .toISOString()
                .split('T')[0];
        }
        this.game.data.genre = data.genre;
    }

    modifyGameTag(name: string, event: MatChipSelectionChange) {
        this.gameDataTags.set(name, event.selected);
    }

    saveGameInfo() {
        if (!this.dialogDataForm.valid) {
            this.dialogDataForm.markAllAsTouched();
            return;
        }

        this.modifyingGame = false;

        for (let [key, value] of this.gameDataTags) {
            switch (key) {
                case 'seriesx': {
                    this.game.data.seriesx = value;
                    break;
                }
                case 'xbone': {
                    this.game.data.xbone = value;
                    break;
                }
                case 'windows': {
                    this.game.data.windows = value;
                    break;
                }
                case 'cloud': {
                    this.game.data.cloud = value;
                    break;
                }
                case 'crossplatMultiplayer': {
                    this.game.data.crossplatMultiplayer = value;
                    break;
                }
                case 'crossplatCoop': {
                    this.game.data.crossplatCoop = value;
                    break;
                }
            }
        }

        this.dialog.close(this.game);
    }
}
