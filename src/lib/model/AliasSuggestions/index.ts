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
 class AliasSuggestionsTitle extends Alias {
    public constructor(colAlias: string, colBuilding: string, colRoom: string) {
        super(colAlias, colBuilding, colRoom, undefined);
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
export class AliasSuggestions extends TableManager<Alias> {

    private static readonly colAlias: string = "Alias";
    private static readonly colBuilding: string = "Gebäude";
    private static readonly colRoom: string = "Raum";

    private static readonly title: AliasSuggestionsTitle
        = new AliasSuggestionsTitle(AliasSuggestions.colAlias, AliasSuggestions.colBuilding, AliasSuggestions.colRoom);

    /**
     * Create the official aliases and set the data accordingly.
     * @param data If provided sets the data of the table. 
     */
     public constructor(data?: Alias[]) {
        let sorters: Map<string, Sorter<TableRow<string>>> = new Map();
        sorters.set(AliasSuggestions.colAlias, lexicographicSorter);
        sorters.set(AliasSuggestions.colBuilding, lexicographicSorter);
        sorters.set(AliasSuggestions.colRoom, lexicographicSorter);
        super(
            AliasSuggestions.title, data, sorters, {
                title: "Aktionen",
                actions: [{
                    onClick: (entry: Alias) => [
                        () => {
                            Framework.getInstance().addChange(() => {this.removeData(entry); return true;}, 
                            () => {this.show(entry); return true;}, 
                            "Offizielle Aliasse", 
                            "Löschen", 
                            this.getTable().matchData(entry.toDisplayData()))
                        },
                        () => this.hide(entry)
                    ],
                    text: "Löschen",
                }]
            }

        )
    }
}