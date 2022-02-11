/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableRow } from "$lib/model/recursive_table/TableComponents";
import type { ChangeAction } from "./ChangeAction";
import lodash from "lodash";
import { lexicographicSorter, TableManager } from "$lib/model/tables/manager/TableManager";
import type { ToDisplayData } from "$lib/model/tables/manager/ToDisplayData";
import type { Sorter } from "$lib/model/recursive_table/Types";
import type { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter";

export type ChangesListener = (table: Table<string>) => void;

class ChangeTitle implements ToDisplayData {
    private time: string;
    private category: string;
    private description: string;
    private metadata: string;

    public constructor(
        time: string,
        category: string,
        description: string,
        metadata: string) {

        this.time = time;
        this.category = category;
        this.description = description;
        this.metadata = metadata;
    }

    public toDisplayData(): string[] {
        return [this.time, this.category, this.description, this.metadata];
    }
}

/**
 * This class represents the changes made by the current user.
 * Rather than immediately performing changes, changes are saved and performed later.
 * 
 * @author Patrick Schneider
 * @version 0.5
 */
export class Changes extends TableManager<ChangeAction, ChangeTitle>{

    private static readonly colTime: string = "Zeit";
    private static readonly colCategory: string = "Kategorie";
    private static readonly colDescription: string = "Beschreibung";
    private static readonly colMetadata: string = "Änderungen";
    private static readonly title: ChangeTitle = new ChangeTitle(
        Changes.colTime, Changes.colCategory, Changes.colDescription, Changes.colMetadata
    );

    /**
     * Create the changes.
     * Creates an empty table with title.
     */
    public constructor() {
        let sorters: Map<string, Sorter<TableRow<string>>> = new Map();
        sorters.set(Changes.colTime, lexicographicSorter);
        sorters.set(Changes.colCategory, lexicographicSorter);
        sorters.set(Changes.colDescription, lexicographicSorter);
        sorters.set(Changes.colMetadata, lexicographicSorter);

        super(
            Changes.title, [], sorters, {
                title: "Aktionen",
                actions: [
                    {
                        onClick: (entry: ChangeAction) => [
                            () => entry.perform() && this.remove(entry)
                        ],
                        text: "Akzeptieren",
                    }, {
                        onClick: (entry: ChangeAction) => [
                            () => this.remove(entry) && entry.remove()
                        ],
                        text: "Ablehnen",
                    }, 
                ]
            }

        )
    }

    /**
     * Add change actions to be displayed.
     * @param actions {@link ChangeAction}
     */
    public add(...actions: ChangeAction[]) {
        super.addData(...actions);
    }

    /**
     * Removes the given {@link ChangeAction}.
     * Performs the onRemoval-Action.
     * 
     * @param action {@link ChangeAction} to be removed.
     * @returns boolean `true` iff removal was successful
     */
    public remove(action: ChangeAction): boolean {
        if (this.contains(action)) {
            super.removeData(action);
            action.remove();
            return true;
        }
        return false;
    }

    protected async fetchData(): Promise<ChangeAction[]> {
        return undefined;
    }

    public filterableData(): [number, FilterStrategy<string>][] {
        return [
            [0, new LexicographicFilter<string>(Changes.colTime)],
            [1, new LexicographicFilter<string>(Changes.colCategory)],
            [2, new LexicographicFilter<string>(Changes.colDescription)],
            [3, new LexicographicFilter<string>(Changes.colMetadata)],
        ]
    }
}