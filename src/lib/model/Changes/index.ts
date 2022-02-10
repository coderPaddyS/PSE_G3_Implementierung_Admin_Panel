/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableRow } from "../table/TableComponents";
import type { ChangeAction } from "./ChangeAction";
import lodash from "lodash";
import { lexicographicSorter, TableManager } from "../TableManager";
import type { ToDisplayData } from "../TableManager/ToDisplayData";
import type { Sorter } from "../table/Types";
import type { FilterStrategy } from "../TableManager/filter/FilterStrategy";
import { LexicographicFilter } from "../TableManager/filter/LexicographicFilter";

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

    private changes: Array<ChangeAction>;

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
        this.changes = new Array();
    }

    /**
     * Add change actions to be displayed.
     * @param actions {@link ChangeAction}
     */
    public add(...actions: ChangeAction[]) {
        this.changes.push(...actions);
        super.addData(...actions);
    }

    /**
     * Removes a change action identified by its data.
     * 
     * 
     * @param time Date
     * @param category string
     * @param description string
     * @param metadata Key-Value-Object
     * @returns boolean `true` iff removal was successful, `false` if no matching action was found or the removal was not successful
     */
    public async removeByData(time: Date, category: string, description: string, metadata: Object): Promise<boolean> {
        let action = this.changes.filter(c => c.equals(time, category, description, metadata))[0];
        if (action && this.remove(action)) {
            return action.remove()
        }
        return false;
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
            let index = this.changes.indexOf(action);
            this.changes.splice(index, 1);
            action.remove();
            return true;
        }
        return false;
    }

    /**
     * Performs the action identified by the given data.
     * 
     * @param time Date
     * @param category string
     * @param description string
     * @param metadata Key-Value-Object
     * @returns boolean `true` iff action could perform and removed successfully
     */
    public async perform(time: Date, category: string, description: string, metadata: Object): Promise<boolean> {
        let action = this.changes.filter(c => c.equals(time, category, description, metadata))[0];
        if (action && await action.perform()) {
            this.remove(action);
        }
        return action && action.perform() && this.remove(action);
    }

    /**
     * Getter for all changes.
     * @returns An {@link Iterable} of {@link ChangeAction}
     */
    public getChanges(): Iterable<ChangeAction> {
        return this.changes;
    }

       /**
     * Checks if the given ChangeActions are contained in the changes.
     * @param actions `True` iff contained
     */
    public contains(...actions: ChangeAction[]): boolean {
        for (let action of actions) {
            if (!this.changes.includes(action)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if a {@link ChangeAction} matching the given category and metadata is contained.
     * @param category string
     * @param metadata Key-Value-Object
     * @returns `True` if contained
     */
    public containsData(category: string, metadata: Object): boolean {
        return this.changes.filter(action => category == action.getCategory())
            .filter(action => lodash.isEqual(metadata, action.getMetadata()))
            .length > 0;
    }

    protected async fetchData(): Promise<ChangeAction[]> {
        return this.changes;
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