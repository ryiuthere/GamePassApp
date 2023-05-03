import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Game } from './gamedata.model';

@Injectable({
    providedIn: 'root',
})
export class GamedataService {
    private readonly host = 'http://localhost:3000/gamedata';
    constructor(private http: HttpClient) {}

    // Change this for query
    getGames(filters: { filterName: string; value: string }[] = []) {
        let params = new HttpParams();
        filters.forEach((filter) => {
            params.set(filter.filterName, filter.value);
        });
        return this.http.get(this.GetPath(), { params: params });
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
        return path ? `${this.host}/${path}` : `${this.host}`;
    }
}
