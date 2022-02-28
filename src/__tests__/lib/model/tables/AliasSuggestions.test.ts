import type { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import type { Alias } from "$lib/model/tables/official/OfficialAliases";
import { AliasSuggestions, AliasSuggestionsEntry } from "$lib/model/tables/suggestions/AliasSuggestions";
import { jest } from "@jest/globals"

describe("Testing AliasSuggestions.ts", () => {

    const alias: AliasSuggestionsEntry = new AliasSuggestionsEntry("test", "building", "room", 1, 0, 0, "tester");
    let suggestions: AliasSuggestions;

    function init(
        fetch?: <T>(body: string) => Promise<T>, 
        addToBlacklist?: (entry: string) => Promise<boolean>,
        acceptAlias?: (alias: Alias) => Promise<boolean>,
        addChange?: (change: ChangeAction) => void) {
        suggestions = new AliasSuggestions(
            fetch? fetch : jest.fn(), 
            addToBlacklist? addToBlacklist : jest.fn(),
            acceptAlias? acceptAlias : jest.fn(),
            jest.fn(),
            addChange? addChange : jest.fn(),
            [alias]
        )
    }

    beforeEach(() => init());

    test("removeEntry", (done) => {
        let addChange = jest.fn<void, any>().mockImplementation((action: ChangeAction) => {
            action.perform().then(_ => {
                expect((suggestions as any).getTableWithoutFetch().getChildren().length).toBe(0);
                done();
            });
        });
        init(jest.fn(), jest.fn(), jest.fn(), addChange);
        (suggestions as any).removeFromRemote = jest.fn().mockImplementation((_) => true);
        (suggestions as any).removeEntry(alias);
    });

    describe("by mocking fetch:", () => {

        describe("removeFromRemote", () => {
            beforeEach(() => init())
            
            test.each([[true, true], [false, false]])("resolving", (real: boolean, expected: boolean) => {
                (suggestions as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("disapproveAliasSuggestion")) {
                        return Promise.resolve({data: {disapproveAliasSuggestion: expected}})
                    }
                });
                expect((suggestions as any).removeFromRemote(alias)).toEqual(Promise.resolve(real));
            });
        });

        test("blacklist", (done) => {
            let addToBlacklist = jest.fn<Promise<boolean>, [string]>().mockImplementation(async entry => {
                expect(entry).toBe(alias.getName());
                return true;
            });
            let addChange = jest.fn<void, any>().mockImplementation((action: ChangeAction) => {
                action.perform().then(_ => {
                    expect(addToBlacklist).toBeCalled();
                    done();
                });
            });
            init(jest.fn(), addToBlacklist, jest.fn(), addChange);
            
            (suggestions as any).blacklist(alias)
        });

        test("accept", (done) => {
            let acceptAlias = jest.fn<Promise<boolean>, [Alias]>().mockImplementation(async entry => {
                expect(entry.getBuilding()).toEqual(alias.getBuilding());
                expect(entry.getRoom()).toEqual(alias.getRoom());
                expect(entry.getId()).toEqual(alias.getId());
                expect(entry.getName()).toEqual(alias.getName());
                return true;
            });
            let addChange = jest.fn<void, any>().mockImplementation((action: ChangeAction) => {
                action.perform().then(_ => {
                    expect(acceptAlias).toBeCalled();
                    done();
                });
            });
            init(jest.fn(), jest.fn(), acceptAlias, addChange);
            
            (suggestions as any).accept(alias)
        });

        describe("size", () => {
            beforeEach(() => init())
            
            test.each([
                [1, "1"], 
                [42, "42"],
                [0, "0"]
            ])("resolving", (real: number, expected: string) => {
                (suggestions as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("getAmountEntriesAliasSuggestion")) {
                        return Promise.resolve({data: {getAmountEntriesAliasSuggestion: expected}})
                    }
                });
                expect((suggestions as any).size()).toEqual(Promise.resolve(real));
            });
        });

        describe("fetchData", () => {
            beforeEach(() => init())
            
            test.each([
                [[], []], 
                [[{name: "test", mapID: 1, mapObject: "building,room", suggester: "tester", posVotes: 0, negVotes: 0}], [alias]],
                [
                    [{name: "test", mapID: 1, mapObject: "building,room", suggester: "tester", posVotes: 0, negVotes: 0}, 
                     {name: "test2", mapID: 2, mapObject: "building,", suggester: "", posVotes: 1, negVotes: 1}], 
                    [
                        alias, 
                        new AliasSuggestionsEntry("test2", "building", "-", 2, 1, 1, "")]]
                ]
            )("resolving", (real: Object, expected: AliasSuggestionsEntry[]) => {
                (suggestions as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("getAliasSuggestions")) {
                        return Promise.resolve({data: {getAliasSuggestions: real}})
                    }
                });
                expect((suggestions as any).fetchData()).toEqual(Promise.resolve(expected));
            });
        });
    });
});