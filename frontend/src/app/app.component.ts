import { Component, ViewChild } from '@angular/core';
import { GamedataService } from './gamedata/gamedata.service';
import { Game, GamePlayerInfo } from './gamedata/gamedata.model';
import { take } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { CreateGameDialogComponent } from './create-game/create-game-dialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    games: Game[];
    selectedGame: Game | null;
    @ViewChild('sidenav', { read: MatSidenav })
    sideNav!: MatSidenav;
    filters: { filterName: string; value: string }[];
    constructor(
        public dialog: MatDialog,
        private gamedataService: GamedataService
    ) {
        this.games = [];
        this.selectedGame = null;
        this.filters = [];
    }

    ngOnInit() {
        this.getAllGames();
    }

    getAllGames() {
        this.getGames();
    }

    getGames(filters?: { filterName: string; value: string }[]) {
        if (filters) {
            this.filters = filters;
        }

        this.gamedataService
            .getGames(this.filters)
            .pipe(take(1))
            .subscribe((data) => {
                this.games = data as Game[];
                this.games = this.games.sort((a, b) =>
                    a.data.name.localeCompare(b.data.name)
                );
            });
    }

    addGame(game: Game) {
        this.gamedataService
            .addGame(game)
            .pipe(take(1))
            .subscribe({
                next: (_) => this.getGames(),
                error: (_) => alert('Something went wrong.'),
            });
    }

    updateGame(game: Game) {
        console.log(JSON.stringify(game));
        this.gamedataService
            .updateGame(game)
            .pipe(take(1))
            .subscribe({
                next: (_) => this.getGames(),
                error: (_) => alert('Something went wrong.'),
            });
    }

    removeSelectedGame() {
        if (!this.selectedGame) return;

        this.gamedataService
            .deleteGame(this.selectedGame.id)
            .pipe(take(1))
            .subscribe();
        this.games = this.games.filter((g) => g.id !== this.selectedGame!.id);
        this.updateSelectedGame(null);
    }

    openCreateGameDialog() {
        const dialogRef = this.dialog.open(CreateGameDialogComponent, {
            data: { game: null },
        });

        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => {
                if (result) {
                    this.addGame(result);
                }
            });
    }

    updateGameDialog() {
        if (!this.selectedGame) return;

        const dialogRef = this.dialog.open(CreateGameDialogComponent, {
            data: { game: this.selectedGame },
        });
        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => {
                if (result) {
                    this.updateGame(result);
                }
            });
    }

    toggleFavorite(game: Game | null) {
        if (!game) {
            return;
        }

        game.data.favorite = !game.data.favorite;
        this.gamedataService.updateGame(game).pipe(take(1)).subscribe();
    }

    updateSelectedGame(game: Game | null) {
        if (
            this.selectedGame !== null &&
            game !== null &&
            this.selectedGame.id === game.id
        ) {
            this.sideNav.toggle();
            return;
        }

        this.selectedGame = game;
        if (this.selectedGame) {
            this.sideNav.open();
        } else {
            this.sideNav.close();
        }
    }

    getFormattedInfo(info: GamePlayerInfo) {
        var playerCount =
            info.minPlayers == info.maxPlayers
                ? info.maxPlayers == 1
                    ? ''
                    : ` ${info.minPlayers} players`
                : ` ${info.minPlayers}-${info.maxPlayers} players`;
        return `${info.playerType}${playerCount}`;
    }
}
