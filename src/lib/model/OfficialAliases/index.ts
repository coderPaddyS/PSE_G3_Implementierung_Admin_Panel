/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Alias } from "../Alias";
import type { TableRow } from "../table/TableComponents";
import type { Sorter } from "../table/Types";
import { Framework } from "$lib/controller/framework";
import { lexicographicSorter, TableManager } from "../TableManager";

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
 * @version 0.5
 */
export class OfficialAliases extends TableManager<Alias, OfficialAliasesTitle> {

    private static readonly colAlias: string = "Alias";
    private static readonly colBuilding: string = "Gebäude";
    private static readonly colRoom: string = "Raum";

    private static readonly title: OfficialAliasesTitle
        = new OfficialAliasesTitle(OfficialAliases.colAlias, OfficialAliases.colBuilding, OfficialAliases.colRoom);

    private addToBlacklist: (entry: string) => boolean;
    private fetch: <T>(body: string) => Promise<T>

    /**
     * Create the official aliases and set the data accordingly.
     * @param data If provided sets the data of the table. 
     */
     public constructor(
        fetch: <T>(body: string) => Promise<T>,
        addToBlacklist: (entry: string) => boolean, data?: Alias[]) {

        let sorters: Map<string, Sorter<TableRow<string>>> = new Map();
        sorters.set(OfficialAliases.colAlias, lexicographicSorter);
        sorters.set(OfficialAliases.colBuilding, lexicographicSorter);
        sorters.set(OfficialAliases.colRoom, lexicographicSorter);
        super(
            OfficialAliases.title, data? data : [], sorters, {
                title: "Aktionen",
                actions: [
                    {
                        onClick: (entry: Alias) => [
                            () => this.removeEntry(entry),
                            () => this.hide(entry)
                        ],
                        text: "Löschen",
                    }, {
                        onClick: (entry: Alias) => [
                            () => this.blacklist(entry),
                            () => this.hide(entry),
                        ],
                        text: "Blacklisten"
                    }
                ]
            }
        );
        this.addToBlacklist = addToBlacklist;
        this.fetch = fetch;
    }

    public addEntry(entry: Alias): boolean {
        this.addData(entry);
        return true;
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
            "Offizielle Aliase", 
            "Löschen", 
            this.getTableWithoutFetch().matchData(entry.toDisplayData())
        );
    }

    private blacklist(entry: Alias) {
        Framework.getInstance().addChange(
            async () => this.addToBlacklist(entry.getName()),
            async () => {this.show(entry); return true;},
            "Offizielle Aliase",
            "Blacklisten",
            this.getTableWithoutFetch().matchData(entry.toDisplayData())
        );
    }

    /* Hopefully not needed in next version, see below*/
    private async fetchMapData(mapID: number): Promise<[string, string]> {
        return this.fetch<{data: {getMapObject: String}}>(JSON.stringify({
            query: `
                query getMapObject($mapID: Int!) {
                    getMapObject(mapID: $mapID)
                }
            `,
            variables: {
                mapID
            }
        })).then(response => response.data.getMapObject).then(mapObject => {
            let splitted = mapObject.split(',');
            return [splitted[0], splitted[1]];
        })
    }

    protected async fetchData(): Promise<Alias[]> {
        let aliases: Array<Alias> = [
            new Alias("Alias 1", "Gebäude 1", "Raum 1", 1),
            new Alias("Alias 2", "Gebäude 2", "Raum 2", 2),
            new Alias("Alias 45", "Gebäude 45", "Raum 45", 45),
            new Alias("Alias 8", "Gebäude 8", "Raum 8", 8),
            new Alias("Alias 69", "Gebäude 69", "Raum 69", 69),
        ];

        /* Backend does not currently support these queries*/
        /*
        this.fetch<{data: {getAlias: {
            name: string,
            mapID: number
        }[]}}>(JSON.stringify({
            query: `
                query getAlias {
                    getAlias()
                }
            `
        })).then(response => response.data.getAlias.forEach(async entry => {
            let [building, room] = await this.fetchMapData(entry.mapID);
            aliases.push(new Alias(
                entry.name,
                building,
                room,
                entry.mapID,
            ));
        }));*/
        return aliases;
    }
}