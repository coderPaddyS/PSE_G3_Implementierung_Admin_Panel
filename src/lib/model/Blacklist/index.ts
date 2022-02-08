/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Sorter } from "$lib/model/table/Types"
import type { TableRow } from "$lib/model/table/TableComponents";
import { Framework } from "$lib/controller/framework";
import { lexicographicSorter, TableManager } from "../TableManager";
import type { ToDisplayData } from "../TableManager/ToDisplayData";

/**
 * This class represents the blacklist.
 * It is a two-column table, of which the first one contains the relevant data of the blacklist.
 * The second column contains an action to remove the entries from the blacklist.
 * 
 * @author Patrick Schneider
 * @version 0.5
 */
export class Blacklist extends TableManager<BlacklistEntry, BlacklistEntry> {

    private fetch: <T>(body: string) => Promise<T>;

    /**
     * Create the blacklist and set its data accordingly.
     * Copies the data, changes will not be reflected.
     * @param data If provided sets the data of the table. 
     */
    public constructor(fetch: <T>(body: string) => Promise<T>,data?: BlacklistEntry[]) {
        let sorter: Map<string, Sorter<TableRow<string>>> = new Map();
        sorter.set("Eintrag", lexicographicSorter);
        super(
            new BlacklistEntry("Eintrag"), data? data : [], sorter, {
                title: "Aktionen",
                actions: [{
                    onClick: (entry: BlacklistEntry) => [
                        () => this.removeEntry(entry),
                        () => this.hide(entry)
                    ],
                    text: "Löschen",
                }]
            }
        );
        this.fetch = fetch;
    }

    public addEntry(entry: BlacklistEntry): boolean {
        super.addData(entry);
        return true;
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
            "Blacklist", 
            "Löschen ", 
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
        .catch(error => {
            console.log(error);
            return false;
        });
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
}

/**
 * This class represents the data of the Blacklist.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class BlacklistEntry implements ToDisplayData {
    
    private entry: string;

    public constructor(entry: string) {
        this.entry = entry;
    }

    public toDisplayData(): string[] {
        return [this.entry];
    }
}