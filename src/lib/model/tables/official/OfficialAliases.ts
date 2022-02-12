/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Alias } from "$lib/model//Alias";
import type { TableRow } from "$lib/model/recursive_table/TableComponents";
import type { Sorter } from "$lib/model/recursive_table/Types";
import { Framework } from "$lib/controller/framework";
import { lexicographicSorter, TableManager } from "$lib/model/tables/manager/TableManager";
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter";
import type { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";

/**
 * This class represents a type alias to underline the meaning as a title.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
 class OfficialAliasesTitle extends Alias {
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

    private addToBlacklist: (entry: string) => boolean;
    private fetch: <T>(body: string) => Promise<T>

    /**
     * Create the official aliases and set the data accordingly.
     * @param fetch The function used to fetch data from the backend.
     * @param addToBlacklist A consumer used to blacklist entries.
     * @param data If provided, sets the initial table data.
     */
     public constructor(
        fetch: <T>(body: string) => Promise<T>,
        addToBlacklist: (entry: string) => boolean, 
        data?: Alias[]) {

        let sorters: Map<string, Sorter<TableRow<string>>> = new Map();
        sorters.set(OfficialAliases.colAlias, lexicographicSorter(0));
        sorters.set(OfficialAliases.colBuilding, lexicographicSorter(1));
        sorters.set(OfficialAliases.colRoom, lexicographicSorter(2));
        super(
            OfficialAliases.tableName,
            OfficialAliases.title, data? data : [], sorters, {
                title: OfficialAliases.tableName,
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
            }
        );
        this.addToBlacklist = addToBlacklist;
        this.fetch = fetch;
    }

    /**
     * Add an alias to the official aliases.
     * @param entry {@link Alias}
     */
    public addEntry(entry: Alias) {
        this.addData(entry);
    }

    private removeFromRemote(entry: Alias): Promise<boolean> {
        return this.fetch(JSON.stringify({
            query: `
                mutation removeOfficial($alias: String!, $id: Int!) {
                    removeAlias(alias: $alias, mapID: $id): Boolean
                }
            `,
            variables: {
                alias: entry.getName(),
                id: entry.getId()
            }
        }))
    }

    private removeEntry(entry: Alias) {
        Framework.getInstance().addChange(
            async () => {
                if (await this.removeFromRemote(entry)) {
                    this.removeData(entry);
                    return true;
                }
                return false;
            }, 
            async () => {this.show(entry); return true;}, 
            OfficialAliases.tableName, 
            OfficialAliases.butDelete, 
            this.getTableWithoutFetch().matchData(entry.toDisplayData())
        );
    }

    private blacklist(entry: Alias) {
        Framework.getInstance().addChange(
            async () => this.addToBlacklist(entry.getName()),
            async () => {this.show(entry); return true;},
            OfficialAliases.tableName,
            OfficialAliases.butBlacklist,
            this.getTableWithoutFetch().matchData(entry.toDisplayData())
        );
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
                        name: String
                        mapID: Int
                        mapObject: String
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
                        room,
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
        return this.fetch<{data: {getAmountEntriesAliases: string}}>(JSON.stringify({
            query:`
                query size {
                    getAmountEntriesAlias
                }
            `
        })).then(response => Number(response.data.getAmountEntriesAliases))
    }
}