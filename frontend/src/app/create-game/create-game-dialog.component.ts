import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Game, GamePlayerInfo } from '../gamedata/gamedata.model';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { takeWhile } from 'rxjs';
import { MatChipSelectionChange } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

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
        'Action/Adventure',
        'Platformer',
        'Puzzle',
        'Role Playing',
    ];

    updating: boolean;
    modifyingGame: boolean;
    game: Game;
    dialogDataForm!: FormGroup;
    gameDataTags!: Map<string, boolean>;
    playerInfoTags!: FormGroup;
    title!: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialogRef<CreateGameDialogComponent>,
        private formBuilder: FormBuilder
    ) {
        this.modifyingGame = true;
        if (data?.game) {
            this.updating = true;
            this.game = data.game;
        } else {
            this.updating = false;
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
    }

    ngOnInit() {
        this.dialogDataForm = new FormGroup({
            id: new FormControl(this.game.id, [Validators.required]),
            title: new FormControl(this.game.data.name, [Validators.required]),
            description: new FormControl(this.game.data.desc),
            releaseDate: new FormControl(new Date(this.game.data.releaseDate), [
                Validators.required,
            ]),
            genre: new FormControl(this.game.data.genre, [Validators.required]),
        });
        this.dialogDataForm.valueChanges
            .pipe(takeWhile(() => this.modifyingGame))
            .subscribe((data) => this.onDialogChange(data));
        this.gameDataTags = new Map<string, boolean>([
            ['seriesx', this.game.data.seriesx],
            ['xbone', this.game.data.xbone],
            ['windows', this.game.data.windows],
            ['cloud', this.game.data.cloud],
            ['crossplatMultiplayer', this.game.data.crossplatMultiplayer],
            ['crossplatCoop', this.game.data.crossplatCoop],
        ]);
        this.playerInfoTags = this.formBuilder.group({
            singlePlayer: this.GetExistingPlayerInfo(
                this.game.playerInfo,
                'singlePlayer'
            ).enabled,
            localMultiplayer: this.formBuilder.group(
                this.GetExistingPlayerInfo(
                    this.game.playerInfo,
                    'localMultiplayer'
                )
            ),
            localCoop: this.formBuilder.group(
                this.GetExistingPlayerInfo(this.game.playerInfo, 'localCoop')
            ),
            onlineMultiplayer: this.formBuilder.group(
                this.GetExistingPlayerInfo(
                    this.game.playerInfo,
                    'onlineMultiplayer'
                )
            ),
            onlineCoop: this.formBuilder.group(
                this.GetExistingPlayerInfo(this.game.playerInfo, 'onlineCoop')
            ),
        });
        this.title = this.updating ? 'Update Game' : 'Create Game';
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
        if (data.releaseDate instanceof Date && !isNaN(data.releaseDate)) {
            this.game.data.releaseDate = data.releaseDate
                .toISOString()
                .split('T')[0];
        }
        this.game.data.genre = data.genre;
    }

    private applyPlayerTypeChanges() {
        this.game.playerInfo = [];
        if (this.playerInfoTags?.controls['singlePlayer'].value) {
            this.game.playerInfo.push({
                playerType: 'singlePlayer',
                minPlayers: 1,
                maxPlayers: 1,
            });
        }
        if (this.LocalPlayerTypeEnabled('localMultiplayer')) {
            this.game.playerInfo.push({
                playerType: 'localMultiplayer',
                minPlayers: this.LocalPlayerType(
                    'localMultiplayer',
                    'minPlayers'
                ).value,
                maxPlayers: this.LocalPlayerType(
                    'localMultiplayer',
                    'maxPlayers'
                ).value,
            });
        }
        if (this.LocalPlayerTypeEnabled('localCoop')) {
            this.game.playerInfo.push({
                playerType: 'localCoop',
                minPlayers: this.LocalPlayerType('localCoop', 'minPlayers')
                    .value,
                maxPlayers: this.LocalPlayerType('localCoop', 'maxPlayers')
                    .value,
            });
        }
        if (this.LocalPlayerTypeEnabled('onlineMultiplayer')) {
            this.game.playerInfo.push({
                playerType: 'onlineMultiplayer',
                minPlayers: this.LocalPlayerType(
                    'onlineMultiplayer',
                    'minPlayers'
                ).value,
                maxPlayers: this.LocalPlayerType(
                    'onlineMultiplayer',
                    'maxPlayers'
                ).value,
            });
        }
        if (this.LocalPlayerTypeEnabled('onlineCoop')) {
            this.game.playerInfo.push({
                playerType: 'onlineCoop',
                minPlayers: this.LocalPlayerType('onlineCoop', 'minPlayers')
                    .value,
                maxPlayers: this.LocalPlayerType('onlineCoop', 'maxPlayers')
                    .value,
            });
        }
    }

    private LocalPlayerType(playerType: string, info: string) {
        return (this.playerInfoTags?.controls[playerType] as FormGroup)
            ?.controls[info];
    }

    LocalPlayerTypeEnabled(playerType: string): boolean {
        return this.LocalPlayerType(playerType, 'enabled').value;
    }

    GetExistingPlayerInfo(infos: GamePlayerInfo[], playerType: string) {
        let info = { enabled: false, minPlayers: 2, maxPlayers: 2 };
        var relevantInfos = infos.filter(
            (info) => info.playerType === playerType
        );

        if (relevantInfos.length !== 0) {
            info.enabled = true;
            info.minPlayers = relevantInfos[0].minPlayers;
            info.maxPlayers = relevantInfos[0].maxPlayers;
        }

        return info;
    }
}
