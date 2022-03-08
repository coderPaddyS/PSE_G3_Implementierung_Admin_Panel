/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { TableRow } from "$lib/model/recursive_table/TableComponents";
import type { DataObject, Predicate, Sorter } from "$lib/model/recursive_table/Types";
import { lexicographicSorter, TableManager } from "$lib/model/tables/manager/TableManager";
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter";
import type { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
import type { ToDisplayData } from "../manager/ToDisplayData";
import { ChangeAction } from "../changes/ChangeAction";

/**
 * This class represents an Alias.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class Alias implements ToDisplayData {
    private name: string;
    private building: string;
    private room: string;
    private id: number;

    /**
     * Construct a new Alias.
     * @param name the name as string
     * @param building the corresponding building as string
     * @param room the corresponding room as string
     * @param id the map id of the alias as number
     */
    public constructor(name: string, building: string, room: string, id: number) {
        this.name = name;
        this.building = building;
        this.room = room;
        this.id = id;
    }
    
    /**
     * Getter for the name
     * @returns the name as string
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Getter for the building
     * @returns the corresponding building as string
     */
    public getBuilding(): string {
        return this.building;
    }

    /**
     * Getter for the room
     * @returns the corresponding room as string
     */
    public getRoom(): string {
        return this.room;
    }

    /**
     * Getter for the id
     * @returns the map id of the alias as number
     */
    public getId(): number {
        return this.id;
    }
    
    /**
     * Get all data as an array of strings.
     * @returns string[]
     */
    public asArray(): string[] {
        return [...this.toDisplayData(), this.id.toString()];
    }

    public toDisplayData(): string[] {
        return [this.name, this.building, this.room];
    }
}

/**
 * This class represents a type alias to underline the meaning as a title.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class OfficialAliasesTitle extends Alias {
    public constructor(colAlias: string, colBuilding: string, colRoom: string) {
        super(colAlias, colBuilding, colRoom, undefined);
    }
}

/**
 * This class represents the official aliases.
 * The according table consists out of four columns, of which the first three are relevant data.
 * The last column contains actions to react to events.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class OfficialAliases extends TableManager<Alias, OfficialAliasesTitle> {

    private static readonly tableName: string = "Offizielle Aliase";

    private static readonly colAlias: string = "Alias";
    private static readonly colBuilding: string = "Gebäude";
    private static readonly colRoom: string = "Raum";
    private static readonly colActions: string = "Aktionen";

    private static readonly butDelete: string = "Löschen";
    private static readonly butBlacklist: string = "Blacklisten";

    private static readonly title: OfficialAliasesTitle
        = new OfficialAliasesTitle(OfficialAliases.colAlias, OfficialAliases.colBuilding, OfficialAliases.colRoom);

    private addToBlacklist: (entry: string) => Promise<boolean>;
    private fetch: <T>(body: string) => Promise<T>
    private addChange: (ChangeAction) => void;

    /**
     * Create the official aliases and set the data accordingly.
     * @param fetch The function used to fetch data from the backend.
     * @param addToBlacklist A consumer used to blacklist entries.
     * @param data If provided, sets the initial table data.
     */
     public constructor(
        fetch: <T>(body: string) => Promise<T>,
        addToBlacklist: (entry: string) => Promise<boolean>, 
        showEntry: Predicate<DataObject<string>>,
        addChange: (ChangeAction) => void,
        data?: Alias[]) {

        let sorters: Map<string, Sorter<TableRow<string>>> = new Map();
        sorters.set(OfficialAliases.colAlias, lexicographicSorter(0));
        sorters.set(OfficialAliases.colBuilding, lexicographicSorter(1));
        sorters.set(OfficialAliases.colRoom, lexicographicSorter(2));
        super(
            OfficialAliases.tableName,
            OfficialAliases.title, data? data : [], sorters, {
                title: OfficialAliases.colActions,
                actions: [
                    {
                        onClick: (entry: Alias) => [
                            () => this.removeEntry(entry),
                            () => this.hide(entry)
                        ],
                        text: OfficialAliases.butDelete,
                    }, {
                        onClick: (entry: Alias) => [
                            () => this.blacklist(entry),
                            () => this.hide(entry),
                        ],
                        text: OfficialAliases.butBlacklist
                    }
                ]
            }, showEntry
        );
        this.addToBlacklist = addToBlacklist;
        this.fetch = fetch;
        this.addChange = addChange;
    }

    /**
     * Add an alias to the official aliases.
     * @param entry {@link Alias}
     */
    public addEntry(entry: Alias) {
        this.addData(entry);
    }

    private removeFromRemote(entry: Alias): Promise<boolean> {
        return this.fetch<{data: {removeAlias: boolean}}>(JSON.stringify({
            query: `
                mutation removeOfficial($alias: String!, $mapID: Int!) {
                    removeAlias(alias: $alias, mapID: $mapID)
                }
            `,
            variables: {
                alias: entry.getName(),
                mapID: entry.getId()
            }
        })).then(response => response.data.removeAlias);
    }

    private removeEntry(entry: Alias) {
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
            OfficialAliases.tableName,
            OfficialAliases.butDelete, 
        ));
    }

    private blacklist(entry: Alias) {
        this.addChange(new ChangeAction(
            async () => this.addToBlacklist(entry.getName()),
            async () => {this.show(entry); return true;},
            this.getTableWithoutFetch().matchData(entry.toDisplayData()),
            OfficialAliases.tableName,
            OfficialAliases.butBlacklist
        ));
    }

    protected async fetchData(): Promise<Alias[]> {

        return this.fetch<{data: {getAllAliases: {
            name: string,
            mapID: number,
            mapObject: string
        }[]}}>(JSON.stringify({
            query: `
                query getAllAlias {
                    getAllAliases {
                        name
                        mapID
                        mapObject
                    }
                }
            `
        })).then(response => {
            if (response.data) {
                return response.data.getAllAliases.map(entry => {
                    let [building, room,] = entry.mapObject.split(",");
                    return new Alias(
                        entry.name,
                        building,
                        room? room : "-",
                        entry.mapID,
                    );
                });
            } else {
                console.log(response)
            }
        });
    }

    public override filterableData(): [number, FilterStrategy<string>][] {
        return OfficialAliases.title.toDisplayData().map((entry, index) => [index, new LexicographicFilter(entry)]);
    }

    protected async size(): Promise<number> {
        return this.fetch<{data: {getAmountEntriesAlias: string}}>(JSON.stringify({
            query:`
                query size {
                    getAmountEntriesAlias
                }
            `
        })).then(response => {
            if (response.data) {
                return Number(response.data.getAmountEntriesAlias)
            } else {
                console.log(response)
            }
        })
    }
}
