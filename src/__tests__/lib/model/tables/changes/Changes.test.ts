import { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import { Changes } from "$lib/model/tables/changes/Changes";
import type { Action } from "$lib/model/tables/changes/Action";
import { jest } from "@jest/globals"

describe("Testing Changes.ts", () => {

    // const alias: AliasSuggestionsEntry = new AliasSuggestionsEntry("test", "building", "room", 1, 0, 0, "tester");
    let changes: Changes;

    function init() {
        changes = new Changes()
    }

    beforeEach(() => init());

    test("fetchData", () => {
        expect((changes as any).fetchData()).toEqual(Promise.resolve(undefined));
    });

    test("size", () => {
        expect((changes as any).size()).toEqual(Promise.resolve(undefined));
    });

    describe("remove", () => {
        beforeEach(() => init());

        test("on empty", () => {
            expect(changes.remove(undefined)).toBe(false);
        });

        test("on contained", () => {
            let action: Action = jest.fn();
            let onRemove: Action = jest.fn();
            let change = new ChangeAction(action, onRemove, {}, "test", "test");
            changes.add(change);
            expect(changes.remove(change)).toBe(true);
            expect(onRemove).not.toBeCalled();
        });

        test("on not contained", () => {
            changes.add(new ChangeAction(jest.fn(), jest.fn(), {}, "test", "test"));
            expect(changes.remove(new ChangeAction(jest.fn(), jest.fn(), {}, "test2", "test2"))).toBe(false);
        });
    });

    describe("containsMetadata", () => {
        beforeEach(() => init());

        test("on empty", () => {
            expect(changes.containsMetadata(undefined)).toBe(false);
        });

        test("on contained", () => {
            let action: Action = jest.fn();
            let onRemove: Action = jest.fn();
            let change = new ChangeAction(action, onRemove, {0: ["a", ["b"]]}, "test", "test");
            changes.add(change);
            expect(changes.containsMetadata({0: ["a", ["b"]]})).toBe(true);
        });

        test("on not contained", () => {
            changes.add(new ChangeAction(jest.fn(), jest.fn(), {}, "test", "test"));
            expect(changes.containsMetadata({0: ["a", ["b"]]})).toBe(false);
        });
    });
});