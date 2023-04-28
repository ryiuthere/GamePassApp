import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Game } from './gamedata.model';

@Injectable({
    providedIn: 'root',
})
export class GamedataService {
    private readonly host = 'http://localhost:3000/gamedata';
    constructor(private http: HttpClient) {}

    getAllGames() {
        return this.http.get(this.GetPath());
    }

    getGames(filters: { filterName: string; value: string }[] = []) {
        return this.http.post(this.GetPath('filtered'), filters);
    }

    addGame(game: Game) {
        return this.http.post(this.GetPath(), game);
    }

    updateGame(game: Game) {
        return this.http.patch(this.GetPath(), game);
    }

    deleteGame(id: string) {
        return this.http.delete(this.GetPath(id));
    }

    private GetPath(path?: string) {
        return path ? `${this.host}/path` : `${this.host}`;
    }
}
