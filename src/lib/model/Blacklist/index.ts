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
export class Blacklist extends TableManager<BlacklistEntry> {

    /**
     * Create the blacklist and set its data accordingly.
     * Copies the data, changes will not be reflected.
     * @param data If provided sets the data of the table. 
     */
    public constructor(data?: BlacklistEntry[]) {
        let sorter: Map<string, Sorter<TableRow<string>>> = new Map();
        sorter.set("Eintrag", lexicographicSorter);
        super(
            new BlacklistEntry("Eintrag"), data, sorter, {
                title: "Aktionen",
                actions: [{
                    onClick: (entry: BlacklistEntry) => [
                        () => {
                            console.log("clicked action of ", entry);
                            Framework.getInstance().addChange(() => {this.removeData(entry); return true;}, 
                            () => {this.show(entry); return true;}, 
                            "Blacklist", 
                            "Löschen " + entry.toDisplayData()[0], 
                            this.getTable().matchData(entry.toDisplayData()))
                        },
                        () => this.hide(entry)
                    ],
                    text: "Löschen",
                }]
            }
        );
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