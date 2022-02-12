/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableComponent } from '$lib/model/recursive_table/TableComponents';
import { jest } from '@jest/globals';

class DummyComponent<T> extends TableComponent<T> {
    public getCrawledOn = jest.fn();
    public getData = jest.fn<any[],any>().mockImplementation(() => {
        return [];
    });
}

describe("Testing if TableComponent ", () => {
    let dummy: DummyComponent<string>;

    beforeEach(() => {
        dummy  = new DummyComponent<string>()
    });

    test("is not hidden", () => {
        expect(dummy.isHidden()).toBe(false);
    });

    test("is filterable", () => {
        expect(dummy.isFilterable()).toBe(true);
    });

    test("hides correctly if shown before", () => {
        dummy.hide();
        expect(dummy.isHidden()).toBe(true);
    });

    test("shows correctly if not hidden before", () => {
        dummy.show();
        expect(dummy.isHidden()).toBe(false);
    });

    test("hides correctly if already hidden", () => {
        dummy.hide();
        dummy.hide();
        expect(dummy.isHidden()).toBe(true);
    });

    test("shows correctly after hidden", () => {
        dummy.hide();
        dummy.show();
        expect(dummy.isHidden()).toBe(false);
    });

    test("has no children after creation", () => {
        expect(dummy.getChildren()).toBe(undefined);
    })
})