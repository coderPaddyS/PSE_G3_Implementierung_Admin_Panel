import type { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import { Alias, OfficialAliases } from "$lib/model/tables/official/OfficialAliases";
import { jest } from "@jest/globals"

describe("Testing OfficialAliases.ts", () => {

    const alias: Alias = new Alias("test", "building", "room", 1);
    let official: OfficialAliases;

    function init(
        fetch?: <T>(body: string) => Promise<T>, 
        addToBlacklist?: (entry: string) => Promise<boolean>,
        addChange?: (change: ChangeAction) => void) {
        official = new OfficialAliases(
            fetch? fetch : jest.fn(), 
            addToBlacklist? addToBlacklist : jest.fn(),
            jest.fn(),
            addChange? addChange : jest.fn(),
            [alias]
        )
    }

    beforeEach(() => init());

    test("removeEntry", (done) => {
        let addChange = jest.fn<void, any>().mockImplementation((action: ChangeAction) => {
            action.perform().then(_ => {
                expect((official as any).getTableWithoutFetch().getChildren().length).toBe(0);
                done();
            });
        });
        init(jest.fn(), jest.fn(), addChange);
        (official as any).removeFromRemote = jest.fn().mockImplementation((_) => true);
        (official as any).removeEntry(alias);
    });

    describe("by mocking fetch:", () => {

        describe("removeFromBackend", () => {
            beforeEach(() => init())
            
            test.each([[true, true], [false, false]])("resolving", (real: boolean, expected: boolean) => {
                (official as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("removeAlias")) {
                        return Promise.resolve({data: {removeAlias: expected}})
                    }
                });
                expect((official as any).removeFromRemote(alias)).toEqual(Promise.resolve(real));
            });
        });

        test("blacklist", (done) => {
            let addToBlacklist = jest.fn<Promise<boolean>, [string]>().mockImplementation(entry => {
                expect(entry).toBe(alias.getName());
                return Promise.resolve(true);
            });
            let addChange = jest.fn<void, any>().mockImplementation((action: ChangeAction) => {
                action.perform().then(_ => {
                    expect(addToBlacklist).toBeCalled();
                    done();
                });
            });
            init(jest.fn(), addToBlacklist, addChange);
            
            (official as any).blacklist(alias)
            
        });

        describe("size", () => {
            beforeEach(() => init())
            
            test.each([
                [1, "1"], 
                [42, "42"],
                [0, "0"]
            ])("resolving", (real: number, expected: string) => {
                (official as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("getAmountEntriesAlias")) {
                        return Promise.resolve({data: {getAmountEntriesAlias: expected}})
                    }
                });
                expect((official as any).size()).toEqual(Promise.resolve(real));
            });
        });

        describe("fetchData", () => {
            beforeEach(() => init())
            
            test.each([
                [[], []], 
                [[{name: "test", mapID: 1, mapObject: "building,room"}], [alias]],
                [
                    [{name: "test", mapID: 1, mapObject: "building,room"}, {name: "test2", mapID: 2, mapObject: "building,"}], 
                    [alias, new Alias("test2", "building", "-", 2)]]
                ]
            )("resolving", (real: Object, expected: Alias[]) => {
                (official as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("getAllAliases")) {
                        return Promise.resolve({data: {getAllAliases: real}})
                    }
                });
                expect((official as any).fetchData()).toEqual(Promise.resolve(expected));
            });
        });
    });
})