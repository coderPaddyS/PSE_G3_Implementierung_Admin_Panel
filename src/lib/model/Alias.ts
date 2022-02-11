/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { ToDisplayData } from "./tables/manager/ToDisplayData";

export class Alias implements ToDisplayData {
    private name: string;
    private building: string;
    private room: string;
    private id: number;

    public constructor(name: string, building: string, room: string, id: number) {
        this.name = name;
        this.building = building;
        this.room = room;
        this.id = id;
    }
    
    public getName(): string {
        return this.name;
    }

    public getBuilding(): string {
        return this.building;
    }

    public getRoom(): string {
        return this.room;
    }

    public getId(): number {
        return this.id;
    }
    
    public asArray(): string[] {
        return [...this.toDisplayData(), this.id.toString()];
    }

    public toDisplayData(): string[] {
        return [this.name, this.building, this.room];
    }
}