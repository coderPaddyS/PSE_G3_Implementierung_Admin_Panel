import { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
import { jest } from "@jest/globals";
import lodash from "lodash";

const NAME = "Filter";

class DummyFilter extends FilterStrategy<string> {
    public filter(data: string[]): boolean {
        return !!data && lodash.isEqual(this.supplier(), data[0]);
    }
}

describe("Testing FilterStrategy", () => {
    let filter: DummyFilter;
    

    beforeEach(() => filter = new DummyFilter(NAME));

    test("to display correctly", () => {
        expect(filter.toDisplayData()).toEqual([NAME]);
    });

    test("to set filter correctly", () => {
        filter.setFilter(() => NAME);
        expect(filter.filter([NAME])).toBe(true);
        expect(filter.filter([""])).toBe(false);
    });
});