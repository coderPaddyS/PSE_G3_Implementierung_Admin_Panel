/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { DataObject, Predicate, Sorter } from "$lib/model/recursive_table/Types"
import type { TableRow } from "$lib/model/recursive_table/TableComponents";
import { Framework } from "$lib/controller/framework";
import { lexicographicSorter, TableManager } from "$lib/model/tables/manager/TableManager";
import type { ToDisplayData } from "$lib/model/tables/manager/ToDisplayData";
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter";
import type { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";

/**
 * This class represents the data of the Blacklist.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
 export class BlacklistEntry implements ToDisplayData {
    
    private entry: string;

    /**
     * Construct a new BlacklistEntry with given string
     * @param entry string
     */
    public constructor(entry: string) {
        this.entry = entry;
    }

    public toDisplayData(): string[] {
        return [this.entry];
    }
}

/** 
 * A type alias to underline the usage
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class BlacklistTitle extends BlacklistEntry {}

/**
 * This class represents the blacklist.
 * It is a two-column table, of which the first one contains the relevant data of the blacklist.
 * The second column contains an action to remove the entries from the blacklist.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class Blacklist extends TableManager<BlacklistEntry, BlacklistTitle> {

    private static readonly tableName: string = "Blacklist";
    private static readonly colEntry: string = "Eintrag";
    private static readonly colAction: string = "Aktionen";
    private static readonly butDelete: string = "Löschen";

    private static readonly title: BlacklistTitle = new BlacklistTitle(this.colEntry);
    private fetch: <T>(body: string) => Promise<T>;

    /**
     * Create the blacklist and set its data accordingly.
     * @param fetch The function used to fetch data from the backend.
     * @param data If provided sets the data of the table. 
     */
    public constructor(fetch: <T>(body: string) => Promise<T>, showEntry: Predicate<DataObject<string>>, data?: BlacklistEntry[]) {
        let sorter: Map<string, Sorter<TableRow<string>>> = new Map();
        sorter.set(Blacklist.colEntry, lexicographicSorter(0));
        super(
            Blacklist.tableName,
            Blacklist.title, 
            data? data : [], 
            sorter, {
                title: Blacklist.colAction,
                actions: [{
                    onClick: (entry: BlacklistEntry) => [
                        () => this.removeEntry(entry),
                        () => this.hide(entry)
                    ],
                    text: Blacklist.butDelete,
                }]
            }, showEntry
        );
        this.fetch = fetch;
    }

    /**
     * Add an entry to the blacklist
     * @param entry {@link BlacklistEntry}
     */
    public addEntry(entry: BlacklistEntry) {
        super.addData(entry);
    }

    private removeEntry(entry: BlacklistEntry) {
        Framework.getInstance().addChange(
            async () => {
                let success = await this.removeFromBackend(entry);
                if (success) {
                    this.removeData(entry);
                }
                return success;
            }, 
            async () => {this.show(entry); return true;}, 
            Blacklist.tableName, 
            Blacklist.butDelete, 
            this.getTableWithoutFetch().matchData(entry.toDisplayData())
        );
    }

    private removeFromBackend(entry: BlacklistEntry): Promise<boolean> {
        return this.fetch<{data: {removeFromBlacklist: boolean}}>(JSON.stringify({
            query: `
                mutation removeFromBlacklist($entry: String!) {
                    removeFromBlacklist(blacklistedToRem: $entry)
                }
            `,
            variables: {
                entry: entry.toDisplayData()[0]
            }
        })).then(response => response.data.removeFromBlacklist)
    }

    protected override async fetchData(): Promise<Array<BlacklistEntry>> {
        return this.fetch<{data: {getBlacklist: string[]}}>(JSON.stringify({
            query: `
                query getBlacklistEntries {
                    getBlacklist
                }
            `
        })).then(response => response.data.getBlacklist.map(entry => new BlacklistEntry(entry)));
    }

    public override filterableData(): [number, FilterStrategy<string>][] {
        return Blacklist.title.toDisplayData().map((entry, index) => [index, new LexicographicFilter(entry)]);
    }

    protected async size(): Promise<number> {
        return this.fetch<{data: {getAmountEntriesBlacklist: string}}>(JSON.stringify({
            query:`
                query size {
                    getAmountEntriesBlacklist
                }
            `
        })).then(response => Number(response.data.getAmountEntriesBlacklist))
    }
}
