/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { ToDisplayData } from "./tables/manager/ToDisplayData";

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
     * @param name string
     * @param building string
     * @param room string
     * @param id number
     */
    public constructor(name: string, building: string, room: string, id: number) {
        this.name = name;
        this.building = building;
        this.room = room;
        this.id = id;
    }
    
    /**
     * Getter for the name
     * @returns string
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Getter for the building
     * @returns string
     */
    public getBuilding(): string {
        return this.building;
    }

    /**
     * Getter for the room
     * @returns string
     */
    public getRoom(): string {
        return this.room;
    }

    /**
     * Getter for the id
     * @returns number
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