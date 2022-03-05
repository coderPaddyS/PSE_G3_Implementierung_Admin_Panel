import type { DataObject } from "$lib/model/recursive_table/Types";
import type { Action } from "$lib/model/tables/changes/Action";
import { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import { jest } from "@jest/globals";

describe("Testing ChangeAction.test.ts", () => {
    const metadata: DataObject<string> = {0: ["a", ["b"]]};
    const category: string = "cat";
    const description: string = "des";

    let change: ChangeAction;
    let action: Action;
    let onRemoval: Action;
    let start: number;

    beforeEach(() => {
        action = jest.fn();
        onRemoval = jest.fn();
        start = Date.now();
        change = new ChangeAction(
            action,
            onRemoval,
            metadata,
            category,
            description
        )
    });

    test("perform", () => {
        change.perform();
        expect(action).toBeCalled();
    });

    test("remove", () => {
        change.remove();
        expect(onRemoval).toBeCalled();
    });

    test("getMetadata", () => {
        expect(change.getMetadata()).toBe(metadata);
    });

    test("getCategory", () => {
        expect(change.getCategory()).toBe(category);
    });

    test("getDescription", () => {
        expect(change.getDescription()).toBe(description);
    });

    test("getCreationTime", () => {
        expect(change.getCreationTime().getTime()).toBeGreaterThanOrEqual(start);
        expect(change.getCreationTime().getTime()).toBeLessThanOrEqual(Date.now());
    });

    test("equals correct data", () => {
        expect(change.equals(
            change.getCreationTime(),
            category,
            description,
            metadata
        )).toBe(true);
    });

    test("equals false data", () => {
        expect(change.equals(
            change.getCreationTime(),
            category,
            description,
            undefined
        )).toBe(false);
    });

    test("equalsData correct metadata", () => {
        expect(change.equalsData(metadata)).toBe(true);
    });

    test("equalsData false metadata", () => {
        expect(change.equalsData(undefined)).toBe(false);
    });
});