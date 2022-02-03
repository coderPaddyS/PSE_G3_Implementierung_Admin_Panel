/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Action } from "./Action";

import lodash from "lodash";

/**
 * A ChangeAction is a data class to contain relevant information to an action event.
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class ChangeAction {
    private action: Action;
    private onRemoval: Action;
    private creationTime: Date;
    private category: string;
    private metadata: Object;
    private description: string;

    /**
     * Construct a new ChangeAction to store the action.
     * 
     * @param action The {@link Action} to be executed
     * @param onRemoval The {@link Action} to be executed if the event is aborted
     * @param metadata The data affected by this change as as Key-Value-Object
     * @param category The category affected by this change as string
     * @param description The description of what this action does
     */
    public constructor(action: Action, onRemoval: Action, metadata: Object, category: string, description: string) {
        this.creationTime = new Date();
        this.category = category;
        this.action = action;
        this.onRemoval = onRemoval;
        this.metadata = metadata;
        this.description = description;
    }

    /**
     * Performs the action.
     * @returns the result of this action
     */
    public perform(): boolean {
        return this.action();
    }

    /**
     * Performs the onRemoval-Action.
     * @returns the result of the removal-Action
     */
    public remove(): boolean {
        return this.onRemoval();
    }

    /**
     * Getter for the category
     * @returns string
     */
    public getCategory() {
        return this.category;
    }

    /**
     * Getter for the metadata
     * @returns Key-Value-Object
     */
    public getMetadata() {
        return this.metadata;
    }

    /**
     * Getter for the creation time of this action
     * @returns Date
     */
    public getCreationTime(): Date {
        return this.creationTime;
    }

    /**
     * Getter for the description of this action
     * @returns string
     */
    public getDescription(): string {
        return this.description
    }

    /**
     * Test if the current action is identified by the provided data.
     * @param time Date
     * @param category string
     * @param description string
     * @param metadata Key-Value-Object
     * @returns {@code true} iff equal
     */
    public equals(time: Date, category: string, description: string, metadata: Object): boolean {
        return lodash.isEqual(time, this.creationTime) && this.category == category && this.description == description && lodash.isEqual(this.metadata, metadata);
    }
}