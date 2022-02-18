import { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
import { MaximumNumericFilter } from "$lib/model/tables/manager/filter/MaximumNumericFilter";
import { jest } from "@jest/globals";
import lodash from "lodash";

const NAME = "name";

describe("Testing MaximumNumericFilter", () => {
    let filter: MaximumNumericFilter<number>;

    beforeEach(() => {
        filter = new MaximumNumericFilter<number>(NAME);
    });

    test("to filter correctly", () => {
        filter.setFilter(() => 42);
        expect(filter.filter([0])).toBe(true);
        expect(filter.filter([2])).toBe(true);
        expect(filter.filter([21])).toBe(true);
        expect(filter.filter([-5])).toBe(true);
        expect(filter.filter([42])).toBe(true);
        expect(filter.filter([-9999])).toBe(true);
        expect(filter.filter([0.815])).toBe(true);
        expect(filter.filter([45])).toBe(false);
        expect(filter.filter([43])).toBe(false);
        expect(filter.filter(undefined)).toBe(undefined);
    });

    test("to return undefined if no filter is set", () => {
        expect(filter.filter([1])).toBe(undefined);
    });

    test("to return undefined if filter value is undefined", () => {
        filter.setFilter(() => undefined);
        expect(filter.filter([1])).toBe(undefined);
    });

    test("to be true if anything matches", () => {
        filter.setFilter(() => 42);
        expect(filter.filter([42, 43, 44, 45, 46, 99])).toBe(true);
    });
});