import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Game } from '../gamedata/gamedata.model';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { takeWhile } from 'rxjs';
import { MatChipSelectionChange } from '@angular/material/chips';

@Component({
    selector: 'create-game-dialog',
    templateUrl: './create-game-dialog.component.html',
    styleUrls: ['./create-game-dialog.component.scss'],
})
export class CreateGameDialogComponent {
    readonly genres = [
        'Indie',
        'Strategy',
        'Shooter',
        'Sports',
        'Action & Adventure',
        'Platformer',
        'Puzzle',
        'Role Playing',
    ];

    modifyingGame: boolean;
    game: Game;
    dialogDataForm: FormGroup;
    gameDataTags: Map<string, boolean>;

    playerInfoTags = this.formBuilder.group({
        singlePlayer: false,
        localMulti: this.formBuilder.group({
            enabled: false,
            minPlayers: 2,
            maxPlayers: 2,
        }),
        localCoop: this.formBuilder.group({
            enabled: false,
            minPlayers: 2,
            maxPlayers: 2,
        }),
        onlineMulti: this.formBuilder.group({
            enabled: false,
            minPlayers: 2,
            maxPlayers: 2,
        }),
        onlineCoop: this.formBuilder.group({
            enabled: false,
            minPlayers: 2,
            maxPlayers: 2,
        }),
    });

    constructor(
        private dialog: MatDialogRef<CreateGameDialogComponent>,
        private formBuilder: FormBuilder
    ) {
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
        this.modifyingGame = true;
        this.dialogDataForm = new FormGroup({
            id: new FormControl(this.game.id, [Validators.required]),
            title: new FormControl(this.game.data.name, [Validators.required]),
            description: new FormControl(this.game.data.desc),
            releaseDate: new FormControl(Date, [Validators.required]),
            genre: new FormControl(this.game.data.genre, [Validators.required]),
        });
        this.dialogDataForm.valueChanges
            .pipe(takeWhile(() => this.modifyingGame))
            .subscribe((data) => this.onDialogChange(data));
        this.gameDataTags = new Map<string, boolean>();
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
        this.applyPlayerTypeChanges();
        this.dialog.close(this.game);
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

    private applyPlayerTypeChanges() {
        if (this.playerInfoTags.value.singlePlayer) {
            this.game.playerInfo.push({
                playerType: 'singlePlayer',
                minPlayers: 1,
                maxPlayers: 1,
            });
        }
        if (this.playerInfoTags.value.localMulti?.enabled) {
            this.game.playerInfo.push({
                playerType: 'localMultiplayer',
                minPlayers: this.playerInfoTags.value.localMulti.minPlayers!,
                maxPlayers: this.playerInfoTags.value.localMulti.maxPlayers!,
            });
        }
        if (this.playerInfoTags.value.localCoop?.enabled) {
            this.game.playerInfo.push({
                playerType: 'localCoop',
                minPlayers: this.playerInfoTags.value.localCoop.minPlayers!,
                maxPlayers: this.playerInfoTags.value.localCoop.maxPlayers!,
            });
        }
        if (this.playerInfoTags.value.onlineMulti?.enabled) {
            this.game.playerInfo.push({
                playerType: 'onlineMultiplayer',
                minPlayers: this.playerInfoTags.value.onlineMulti.minPlayers!,
                maxPlayers: this.playerInfoTags.value.onlineMulti.maxPlayers!,
            });
        }
        if (this.playerInfoTags.value.onlineCoop?.enabled) {
            this.game.playerInfo.push({
                playerType: 'onlineCoop',
                minPlayers: this.playerInfoTags.value.onlineCoop.minPlayers!,
                maxPlayers: this.playerInfoTags.value.onlineCoop.maxPlayers!,
            });
        }
    }
}
