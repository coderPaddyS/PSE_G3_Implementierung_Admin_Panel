import { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter";
import { jest } from "@jest/globals";
import lodash from "lodash";

const NAME = "name";

describe("Testing LexicographicFilter", () => {
    let filter: LexicographicFilter<string>;

    beforeEach(() => {
        filter = new LexicographicFilter(NAME);
    });

    test("to filter correctly", () => {
        filter.setFilter(() => NAME);
        expect(filter.filter([""])).toBe(false);
        expect(filter.filter(["n"])).toBe(false);
        expect(filter.filter(["na"])).toBe(false);
        expect(filter.filter(["nam"])).toBe(false);
        expect(filter.filter(["name"])).toBe(true);
        expect(filter.filter(["name234"])).toBe(true);
        expect(filter.filter(["name apollo"])).toBe(true);
        expect(filter.filter(["na me apollo"])).toBe(false);
        expect(filter.filter(["m"])).toBe(false);
        expect(filter.filter(["er"])).toBe(false);
        expect(filter.filter(["th"])).toBe(false);
        expect(filter.filter(["er"])).toBe(false);
        expect(filter.filter(undefined)).toBe(undefined);
    });

    test("to return undefined if no filter is set", () => {
        expect(filter.filter([""])).toBe(undefined);
    });

    test("to return undefined if filter value is empty", () => {
        filter.setFilter(() => "");
        expect(filter.filter([])).toBe(undefined);
    });

    test("to be true if anything matches", () => {
        filter.setFilter(() => NAME);
        expect(filter.filter(["", "n", "na", "nam", "name", "m", "er", "th", "ui"])).toBe(true);
    });
});