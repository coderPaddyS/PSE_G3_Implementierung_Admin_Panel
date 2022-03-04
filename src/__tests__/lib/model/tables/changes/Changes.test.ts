import { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import { Changes } from "$lib/model/tables/changes/Changes";
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


});