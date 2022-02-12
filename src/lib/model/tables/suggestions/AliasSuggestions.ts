/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Alias } from "$lib/model/Alias";
import type { TableRow } from "$lib/model/recursive_table/TableComponents";
import type { Sorter } from "$lib/model/recursive_table/Types";
import { Framework } from "$lib/controller/framework";
import { lexicographicSorter, TableManager } from "$lib/model/tables/manager/TableManager"
import type { ToDisplayData } from "$lib/model/tables/manager/ToDisplayData"
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter" 
import { MinimumNumericFilter } from "$lib/model/tables/manager/filter/MinimumNumericFilter"; 
import type { FilterStrategy } from "../manager/filter/FilterStrategy";

export class AliasSuggestionsEntry extends Alias implements ToDisplayData {
    private suggester: string;
    private upvotes: number;
    private downvotes: number;

    public constructor(
        name: string, 
        building: string, 
        room: string, 
        id: number,
        upvotes: number,
        downvotes: number,
        suggester: string) {

        super(name, building, room, id);
        this.suggester = suggester;
        this.upvotes = upvotes;
        this.downvotes = downvotes;
    }

    public getSuggester(): string {
        return this.suggester;
    }

    public getUpvotes(): number {
        return this.upvotes;
    }

    public getDownvotes(): number {
        return this.downvotes;
    }

    public override toDisplayData(): string[] {
        return [...super.toDisplayData(), this.upvotes.toString(), this.downvotes.toString()];
    }
}

/**
 * This class represents a type alias to underline the meaning as a title.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
 class AliasSuggestionsTitle implements ToDisplayData {
    private name: string;
    private building: string;
    private room: string;
    private upvotes: string;
    private downvotes: string;

    public constructor(
        name: string,
        building: string,
        room: string,
        upvotes: string,
        downvotes: string) {

        this.name = name;
        this.building = building;
        this.room = room;
        this.upvotes = upvotes;
        this.downvotes = downvotes;
    }

    public toDisplayData(): string[] {
        return [this.name, this.building, this.room, this.upvotes, this.downvotes];
    }
}

/**
 * This class represents the alias suggestions.
 * The according table consists out of four columns, of which the first three are relevant data.
 * The last column contains actions to react to events.
 * 
 * @author Patrick Schneider
 * @version 0.5
 */
export class AliasSuggestions extends TableManager<AliasSuggestionsEntry, AliasSuggestionsTitle> {

    private static readonly colAlias: string = "Alias";
    private static readonly colBuilding: string = "Gebäude";
    private static readonly colRoom: string = "Raum";
    private static readonly colUpvotes: string = "Positiv";
    private static readonly colDownvotes: string = "Negativ";

    private static readonly title: AliasSuggestionsTitle = new AliasSuggestionsTitle(
        AliasSuggestions.colAlias, 
        AliasSuggestions.colBuilding, 
        AliasSuggestions.colRoom,
        AliasSuggestions.colUpvotes,
        AliasSuggestions.colDownvotes
    );

    private fetch: <T>(body: string) => Promise<T>;
    private addToBlacklist: (entry: string) => Promise<boolean>;
    private acceptAlias: (alias: Alias) => Promise<boolean>;

    private minUpvotes: number;
    private minDownvotes: number;

    /**
     * Create the alias suggestions and set the data accordingly.
     * @param data If provided sets the data of the table. 
     */
     public constructor(
        fetch: <T>(body: string) => Promise<T>,
        addToBlacklist: (entry: string) => Promise<boolean>,
        acceptAlias: (alias: Alias) => Promise<boolean>,
        data?: AliasSuggestionsEntry[]) {

        let sorters: Map<string, Sorter<TableRow<string>>> = new Map();
        sorters.set(AliasSuggestions.colAlias, lexicographicSorter);
        sorters.set(AliasSuggestions.colBuilding, lexicographicSorter);
        sorters.set(AliasSuggestions.colRoom, lexicographicSorter);
        sorters.set(AliasSuggestions.colUpvotes, lexicographicSorter);
        sorters.set(AliasSuggestions.colDownvotes, lexicographicSorter);
        super(
            "Alias-Vorschläge",
            AliasSuggestions.title, data? data : [], sorters, {
                title: "Aktionen",
                actions: [
                    {
                        onClick: (entry: AliasSuggestionsEntry) => [
                            () => this.removeEntry(entry),
                            () => this.hide(entry)
                        ],
                        text: "Löschen",
                    }, {
                        onClick: (entry: AliasSuggestionsEntry) => [
                            () => this.blacklist(entry),
                            () => this.hide(entry)
                        ],
                        text: "Blacklisten"
                    }, {
                        onClick: (entry: AliasSuggestionsEntry) => [
                            () => this.accept(entry),
                            () => this.hide(entry)
                        ],
                        text: "Akzeptieren"
                    }
                ]
            }
        );
        this.fetch = fetch;
        this.addToBlacklist = addToBlacklist;
        this.acceptAlias = acceptAlias;
    }

    private removeFromRemote(entry: Alias): Promise<boolean> {
        return this.fetch(JSON.stringify({
            query: `
                mutation removeSuggestion($alias: String!, $id: Int!) {
                    disapproveAliasSuggestion(aliasSuggestion: $alias, mapID: $id): Boolean
                }
            `,
            variables: {
                alias: entry.getName(),
                id: entry.getId()
            }
        }))
    }

    private removeEntry(entry: AliasSuggestionsEntry) {
        Framework.getInstance().addChange(
            async () => {
                if (await this.removeFromRemote(entry)) {
                    this.removeData(entry);
                    return true;
                } 
                return false;
            }, 
            async () => {this.show(entry); return true;}, 
            "Aliasvorschläge", 
            "Löschen", 
            this.getTableWithoutFetch().matchData(entry.toDisplayData())
        );
    }

    private blacklist(entry: AliasSuggestionsEntry) {
        Framework.getInstance().addChange(
            async () => this.addToBlacklist(entry.getName()),
            async () => {this.show(entry); return true;},
            "Aliasvorschläge",
            "Blacklisten",
            this.getTableWithoutFetch().matchData(entry.toDisplayData())
        );
    }

    private accept(entry: AliasSuggestionsEntry) {
        Framework.getInstance().addChange(
            async () => this.acceptAlias(entry),
            async () => {this.show(entry); return true;},
            "Aliasvorschläge",
            "Akzeptieren",
            this.getTableWithoutFetch().matchData(entry.toDisplayData())
        )
    }

    protected async fetchData(): Promise<Array<AliasSuggestionsEntry>> {
        // let suggestions: Array<AliasSuggestionsEntry> = [
        //     new AliasSuggestionsEntry("Nutte", "Infobau", "-109", 79128763, 10, 5, "test"),
        //     new AliasSuggestionsEntry("Alias 0", "Gebäude 0", "Raum 0", 0, 10, 5, "test"),
        //     new AliasSuggestionsEntry("Alias 3", "Gebäude 3", "Raum 3", 3, 10, 5, "test"),
        //     new AliasSuggestionsEntry("Alias 49", "Gebäude 49", "Raum 49", 49, 10, 5, "test"),
        //     new AliasSuggestionsEntry("Alias 42", "Gebäude 42", "Raum 42", 42, 10, 5, "test"),
        //     new AliasSuggestionsEntry("Alias 420", "Gebäude 420", "Raum 420", 420, 10, 5, "test"),
        // ];
        
        return this.fetch<{data: {
            getAliasSuggestions: {
                suggester: string
                name: string
                posVotes: number
                negVotes: number
                mapID: number
                mapObject: string
            }[],
        }}>(JSON.stringify({
            query: `
                query getAliasSuggestions($minPositive: Int!, $minNegative: Int!) {
                    getAliasSuggestions(minValToShowPos: $minPositive, minValToShowNeg: $minNegative) {
                        suggester
                        name
                        posVotes
                        negVotes
                        mapID
                        mapObject
                    }
                }
            `,
            variables: {
                minPositive: 0,
                minNegative: 0
            }
        })).then(response => {
            if (response.data) {
                return response.data.getAliasSuggestions.map(entry => {
                    let [building, room,] = entry.mapObject.split(",");
                    return new AliasSuggestionsEntry(
                        entry.name,
                        building,
                        room,
                        entry.mapID,
                        entry.posVotes,
                        entry.negVotes,
                        entry.suggester
                    );
            }
        )}});
    }

    public override filterableData(): [number, FilterStrategy<string>][] {
        return [
            [0, new LexicographicFilter(AliasSuggestions.colAlias)],
            [1, new LexicographicFilter(AliasSuggestions.colBuilding)],
            [2, new LexicographicFilter(AliasSuggestions.colRoom)],
            [3, new MinimumNumericFilter(AliasSuggestions.colUpvotes)],
            [4, new MinimumNumericFilter(AliasSuggestions.colDownvotes)],
        ];
    }

    protected async size(): Promise<number> {
        return this.fetch<{data: {getAmountEntriesAliasSuggestion: string}}>(JSON.stringify({
            query:`
                query size {
                    getAmountEntriesAliasSuggestion
                }
            `
        })).then(response => Number(response.data.getAmountEntriesAliasSuggestion))
    }
}