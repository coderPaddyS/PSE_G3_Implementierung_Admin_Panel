/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Alias } from '$lib/model/Alias';
import { jest } from '@jest/globals';

describe("Testing if Alias ", () => {
    const name = "Alias 1";
    const building = "Building 1";
    const room = "room 1";
    const id = 1;

    test("stores data correctly", () => {
        let alias: Alias = new Alias(name, building, room, id);

        expect(alias.getName()).toBe(name);
        expect(alias.getBuilding()).toBe(building);
        expect(alias.getRoom()).toBe(room);
        expect(alias.getId()).toBe(id);
    });

    test("handles undefined correctly", () => {
        let alias: Alias = new Alias(undefined, undefined, undefined, undefined);
        expect(alias.getName()).toBe(undefined);
        expect(alias.getBuilding()).toBe(undefined);
        expect(alias.getRoom()).toBe(undefined);
        expect(alias.getId()).toBe(undefined);
    });

    test("returns display data correctly", () => {
        let alias: Alias = new Alias(name, building, room, id);
        expect(alias.toDisplayData()).toEqual([name, building, room]);
    });

    test("returns data as string correctly when using asArray", () => {
        let alias: Alias = new Alias(name, building, room, id);
        expect(alias.asArray()).toEqual([name, building, room, id.toString()]);
    });
})