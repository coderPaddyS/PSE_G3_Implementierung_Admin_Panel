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
     * @param name the name as string
     * @param building the corresponding building as string
     * @param room the corresponding room as string
     * @param id the map id of the alias as number
     */
    public constructor(name: string, building: string, room: string, id: number) {
        this.name = name;
        this.building = building;
        this.room = room;
        this.id = id;
    }
    
    /**
     * Getter for the name
     * @returns the name as string
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Getter for the building
     * @returns the corresponding building as string
     */
    public getBuilding(): string {
        return this.building;
    }

    /**
     * Getter for the room
     * @returns the corresponding room as string
     */
    public getRoom(): string {
        return this.room;
    }

    /**
     * Getter for the id
     * @returns the map id of the alias as number
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