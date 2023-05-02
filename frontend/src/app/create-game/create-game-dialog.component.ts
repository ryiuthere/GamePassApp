import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Game } from '../gamedata/gamedata.model';

@Component({
    selector: 'create-game-dialog',
    templateUrl: './create-game-dialog.component.html',
})
export class CreateGameDialogComponent {
    private game: Game;
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
    }

    saveGameInfo() {
        this.dialog.close(this.game);
    }
}
