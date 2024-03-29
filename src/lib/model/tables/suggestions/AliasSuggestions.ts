/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { TableRow } from "$lib/model/recursive_table/TableComponents";
import type { DataObject, Predicate, Sorter } from "$lib/model/recursive_table/Types";
import { lexicographicSorter, numericSorter, TableManager } from "$lib/model/tables/manager/TableManager"
import type { ToDisplayData } from "$lib/model/tables/manager/ToDisplayData"
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter" 
import { MinimumNumericFilter } from "$lib/model/tables/manager/filter/MinimumNumericFilter"; 
import type { FilterStrategy } from "../manager/filter/FilterStrategy";
import { Alias } from "../official/OfficialAliases";
import { ChangeAction } from "../changes/ChangeAction";
import { Settings } from "$lib/model/settings/Settings";
import type { SettingsData } from "$lib/model/settings/Settings";

/**
 * This class describes an entry for the alias suggestions.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class AliasSuggestionsEntry extends Alias implements ToDisplayData {
    private suggester: string;
    private upvotes: number;
    private downvotes: number;

    /**
     * Initialize a new suggestion
     * @param name the name of the suggestion
     * @param building the building of the suggestion
     * @param room the room of the suggestion
     * @param id the id of the suggestion
     * @param upvotes the number of upvotes of the suggestion
     * @param downvotes the number of downvotes of the suggestion
     * @param suggester the suggester of the suggestion
     */
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

    /**
     * Getter for the suggester
     * @returns suggester
     */
    public getSuggester(): string {
        return this.suggester;
    }

    /**
     * Getter for the upvotes
     * @returns upvotes
     */
    public getUpvotes(): number {
        return this.upvotes;
    }

    /**
     * Getter for the downvotes
     * @returns downvotes
     */
    public getDownvotes(): number {
        return this.downvotes;
    }

    /**
     * Get the alias representation of this suggestion.
     * @returns this suggestion transformed to an alias.
     */
    public toAlias(): Alias {
        return new Alias(this.getName(), this.getBuilding(), this.getRoom(), this.getId());
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
export class AliasSuggestionsTitle implements ToDisplayData {
    private name: string;
    private building: string;
    private room: string;
    private upvotes: string;
    private downvotes: string;

    /**
     * Initialize a new AliasSuggestionsTitle
     * @param name the name column
     * @param building the building column
     * @param room the room column
     * @param upvotes the number of upvotes column
     * @param downvotes the number of downvotes column
     */
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

    private static readonly tableName: string = "Alias-Vorschläge";

    private static readonly colAlias: string = "Alias";
    private static readonly colBuilding: string = "Gebäude";
    private static readonly colRoom: string = "Raum";
    private static readonly colUpvotes: string = "Positiv";
    private static readonly colDownvotes: string = "Negativ";
    private static readonly colActions: string = "Aktionen";

    private static readonly butDelete: string = "Löschen";
    private static readonly butBlacklist: string = "Blacklisten";
    private static readonly butAccept: string = "Akzeptieren";

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
    private addChange: (ChangeAction) => void;

    private minUpvotes: number;
    private minDownvotes: number;

    /**
     * Create the alias suggestions and set the data accordingly.
     * @param fetch The function used to fetch data from the backend.
     * @param addToBlacklist A consumer used to blacklist entries.
     * @param acceptAlias A consumer used to accept aliases.
     * @param data If provided, sets the initial table data.
     */
    public constructor(
        fetch: <T>(body: string) => Promise<T>,
        addToBlacklist: (entry: string) => Promise<boolean>,
        acceptAlias: (alias: Alias) => Promise<boolean>,
        showEntry: Predicate<DataObject<string>>,
        addChange: (ChangeAction) => void,
        data?: AliasSuggestionsEntry[]) {

        let sorters: Map<string, Sorter<TableRow<string>>> = new Map();
        sorters.set(AliasSuggestions.colAlias, lexicographicSorter(0));
        sorters.set(AliasSuggestions.colBuilding, lexicographicSorter(1));
        sorters.set(AliasSuggestions.colRoom, lexicographicSorter(2));
        sorters.set(AliasSuggestions.colUpvotes, numericSorter(3));
        sorters.set(AliasSuggestions.colDownvotes, numericSorter(4));
        super(
            AliasSuggestions.tableName,
            AliasSuggestions.title, data? data : [], sorters, {
                title: AliasSuggestions.colActions,
                actions: [
                    {
                        onClick: (entry: AliasSuggestionsEntry) => [
                            () => this.removeEntry(entry),
                            () => this.hide(entry)
                        ],
                        text: AliasSuggestions.butDelete,
                    }, {
                        onClick: (entry: AliasSuggestionsEntry) => [
                            () => this.blacklist(entry),
                            () => this.hide(entry)
                        ],
                        text: AliasSuggestions.butBlacklist
                    }, {
                        onClick: (entry: AliasSuggestionsEntry) => [
                            () => this.accept(entry),
                            () => this.hide(entry)
                        ],
                        text: AliasSuggestions.butAccept
                    }
                ]
            }, showEntry
        );
        this.fetch = fetch;
        this.addToBlacklist = addToBlacklist;
        this.acceptAlias = acceptAlias;
        this.addChange = addChange;

        Settings.getInstance().onUpdate((settings) => this.onSettingsChange(settings));
        this.onSettingsChange(Settings.getInstance().getData());
    }

    private onSettingsChange(settings: SettingsData) {
        this.minDownvotes = settings.suggestionsMinNegative;
        this.minUpvotes = settings.suggestionsMinPositive;
    }

    private removeFromRemote(entry: Alias): Promise<boolean> {
        return this.fetch<{data: {disapproveAliasSuggestion: boolean}}>(JSON.stringify({
            query: `
                mutation removeSuggestion($aliasSuggestion: String!, $mapID: Int!) {
                    disapproveAliasSuggestion(aliasSuggestion: $aliasSuggestion, mapID: $mapID)
                }
            `,
            variables: {
                aliasSuggestion: entry.getName(),
                mapID: entry.getId()
            }
        })).then(response => response.data.disapproveAliasSuggestion);
    }

    private removeEntry(entry: AliasSuggestionsEntry) {
        this.addChange(new ChangeAction(
            async () => {
                if (await this.removeFromRemote(entry)) {
                    this.removeData(entry);
                    return true;
                } 
                return false;
            }, 
            async () => {this.show(entry); return true;}, 
            this.getTableWithoutFetch().matchData(entry.toDisplayData()),
            AliasSuggestions.tableName, 
            AliasSuggestions.butDelete
        
        ));
    }

    private blacklist(entry: AliasSuggestionsEntry) {
        this.addChange(new ChangeAction(
            async () => this.addToBlacklist(entry.getName()),
            async () => {this.show(entry); return true;},
            this.getTableWithoutFetch().matchData(entry.toDisplayData()),
            AliasSuggestions.tableName,
            AliasSuggestions.butBlacklist
        ));
    }

    private accept(entry: AliasSuggestionsEntry) {
        this.addChange(new ChangeAction(
            async () => this.acceptAlias(entry.toAlias()),
            async () => {this.show(entry); return true;},
            this.getTableWithoutFetch().matchData(entry.toDisplayData()),
            AliasSuggestions.tableName,
            AliasSuggestions.butAccept
        ))
    }

    protected async fetchData(): Promise<Array<AliasSuggestionsEntry>> {
        
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
                query getAliasSuggestions($minValToShowPos: Int!, $minValToShowNeg: Int!) {
                    getAliasSuggestions(minValToShowPos: $minValToShowPos, minValToShowNeg: $minValToShowNeg) {
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
                minValToShowPos: Math.trunc(this.minUpvotes),
                minValToShowNeg: Math.trunc(this.minDownvotes)
            }
        })).then(response => {
            if (response.data) {
                return response.data.getAliasSuggestions.map(entry => {
                    let [building, room,] = entry.mapObject.split(",");
                    return new AliasSuggestionsEntry(
                        entry.name,
                        building,
                        room? room : "-",
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