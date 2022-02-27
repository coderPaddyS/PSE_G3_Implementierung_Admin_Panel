import { Blacklist, BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist"
import type { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import { jest } from "@jest/globals"

describe("Testing Blacklist.ts", () => {

    const entry: string = "test";
    let blacklist: Blacklist;

    function init(fetch?: <T>(body: string) => Promise<T>, addChange?: (change: ChangeAction) => void) {
        blacklist = new Blacklist(
            fetch? fetch : jest.fn(), 
            jest.fn(),
            addChange? addChange : jest.fn(),
            [new BlacklistEntry(entry)]
        )
    }

    beforeEach(() => init());

    test("removeEntry", (done) => {
        let addChange = jest.fn<void, any>().mockImplementation((action: ChangeAction) => {
            action.perform().then(_ => {
                expect((blacklist as any).getTableWithoutFetch().getChildren().length).toBe(0);
                done();
            })
        });
        init(jest.fn(), addChange);
        (blacklist as any).removeFromBackend = jest.fn().mockImplementation((_) => true);
        (blacklist as any).removeEntry(new BlacklistEntry(entry));
    });

    describe("by mocking fetch:", () => {

        describe("removeFromBackend", () => {
            beforeEach(() => init())
            
            test.each([[true, true], [false, false]])("resolving", (real: boolean, expected: boolean) => {
                (blacklist as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("removeFromBlacklist")) {
                        return Promise.resolve({data: {removeFromBlacklist: expected}})
                    }
                });
                expect((blacklist as any).removeFromBackend(new BlacklistEntry(entry))).toEqual(Promise.resolve(real));
            });
        });

        describe("size", () => {
            beforeEach(() => init())
            
            test.each([
                [1, "1"], 
                [42, "42"],
                [0, "0"]
            ])("resolving", (real: number, expected: string) => {
                (blacklist as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("getAmountEntriesBlacklist")) {
                        return Promise.resolve({data: {getAmountEntriesBlacklist: expected}})
                    }
                });
                expect((blacklist as any).size()).toEqual(Promise.resolve(real));
            });
        });

        describe("fetchData", () => {
            beforeEach(() => init())
            
            test.each([
                [[], []], 
                [["test"], [new BlacklistEntry("test")]],
                [["test1", "test2"], [new BlacklistEntry("test1"), new BlacklistEntry("test2")]]
            ])("resolving", (real: string[], expected: BlacklistEntry[]) => {
                (blacklist as any).fetch = jest.fn<Object, [string]>().mockImplementation(body => {
                    if (body.includes("getBlacklist")) {
                        return Promise.resolve({data: {getBlacklist: real}})
                    }
                });
                expect((blacklist as any).fetchData()).toEqual(Promise.resolve(expected));
            });
        });
    });
})