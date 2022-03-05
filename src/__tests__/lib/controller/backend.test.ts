import AuthManager from "$lib/controller/AuthManager";
import { Backend } from "$lib/controller/backend";
import type { Table } from "$lib/model/recursive_table/TableComponents";
import type { DataObject, Predicate } from "$lib/model/recursive_table/Types";
import { Blacklist, BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import type { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import type { TableManager } from "$lib/model/tables/manager/TableManager";
import { Alias, OfficialAliases } from "$lib/model/tables/official/OfficialAliases";
import { AliasSuggestions } from "$lib/model/tables/suggestions/AliasSuggestions";
import { Tables } from "$lib/model/tables/Tables";
import { jest } from "@jest/globals";

jest.mock('$lib/controller/AuthManager');

class DummyOfficial extends OfficialAliases {

    public constructor() {
        super(jest.fn(), jest.fn(), () => true, jest.fn());
    }

    public addEntry = jest.fn();
    public setActionComponentFactory = jest.fn();
}

class DummyBlacklist extends Blacklist {
    public constructor() {
        super(jest.fn(), jest.fn(), jest.fn());
    }

    public addEntry = jest.fn();
    public setActionComponentFactory = jest.fn();
}

class DummySuggestions extends AliasSuggestions {
    public constructor() {
        super(jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn());
    }

    public setActionComponentFactory = jest.fn();
}

describe("Testing Backend.ts", () => {

    let backend: Backend;
    let onError: (error: string | Error) => void;
    let showEntry: Predicate<DataObject<string>>;
    let official: DummyOfficial;
    let blacklist: DummyBlacklist;
    let suggestions: DummySuggestions;

    function mockImplementation(impl: (body: string) => Promise<Object>) {
        (backend as any).fetchBackend = jest.fn().mockImplementation(impl);
    }

    function init() {
        onError = jest.fn();
        showEntry = jest.fn<boolean, any>().mockImplementation(() => true);
        official = new DummyOfficial();
        blacklist = new DummyBlacklist();
        suggestions = new DummySuggestions();
        backend = new Backend(onError, showEntry, jest.fn());
        (backend as any).official = official;
        (backend as any).blacklist = blacklist;
        (backend as any).suggestions = suggestions;
        mockImplementation(jest.fn());
    }

    beforeEach(init)

    describe("by mocking fetch:", () => {

        describe("isAdmin", () => {
            beforeEach(init)
            
            test.each([[true, true], [false, false]])("resolving", (real: boolean, expected: boolean) => {
                mockImplementation(body => {
                    if (body.includes("isAdmin")) {
                        return Promise.resolve({data: {isAdmin: expected}})
                    }
                });
                expect(backend.isAdmin()).toEqual(Promise.resolve(real));
            });

            test("rejected", (done) => {
                mockImplementation(body => {
                    if (body.includes("isAdmin")) {
                        return Promise.reject()
                    }
                });
                backend.isAdmin().then(isAdmin => {
                    expect(onError).toBeCalled();
                    expect(isAdmin).toBe(false);
                    done()
                });
            });
        });

        describe("addToOfficial", () => {
            beforeEach(init);

            describe.each([[true, true],[false, false]])("resolves", (real: boolean, expected: boolean) => {
                test(`${expected}`, (done) => {
                    const alias: Alias = new Alias("test", "test", "test", 1)
                    mockImplementation(body => {
                        if (body.includes("approveAliasSuggestion")) {
                            return Promise.resolve({data: {approveAliasSuggestion: real}})
                        }
                    });
                    (backend as any).addToOfficial(alias).then(result => {
                        expect(result).toBe(expected);
                        if (expected) {
                            expect(official.addEntry).toBeCalled();
                        }
                        done();
                    });
                });
            });

            test("rejects", (done) => {
                const alias: Alias = new Alias("test", "test", "test", 1)
                mockImplementation(body => {
                    if (body.includes("approveAliasSuggestion")) {
                        return Promise.reject();
                    }
                });
                (backend as any).addToOfficial(alias).then(result => {
                    expect(result).toBe(false);
                    expect(onError).toBeCalled();
                    done();
                });
            });
        });

        describe("addToBlacklist", () => {
            beforeEach(init);

            describe.each([[true, true],[false, false]])("resolves", (real: boolean, expected: boolean) => {
                test(`${expected}`, (done) => {
                    mockImplementation(body => {
                        if (body.includes("blacklistAlias")) {
                            return Promise.resolve({data: {blacklistAlias: real}})
                        }
                    });
                    backend.addToBlacklist(new BlacklistEntry("test")).then(result => {
                        expect(result).toBe(expected);
                        if (expected) {
                            expect(blacklist.addEntry).toBeCalled();
                        }
                        done();
                    });
                });
            });

            test("rejects", (done) => {
                mockImplementation(body => {
                    if (body.includes("blacklistAlias")) {
                        return Promise.reject();
                    }
                });
                backend.addToBlacklist(new BlacklistEntry("test")).then(result => {
                    expect(result).toBe(false);
                    expect(onError).toBeCalled();
                    done();
                });
            });
        });

        describe("setActionComponentFactory", () => {
            beforeEach(init);
            test("blacklist", () => {
                backend.setActionComponentFactory(Tables.BLACKLIST, undefined);
                expect(blacklist.setActionComponentFactory).toBeCalled();
            });
            test("suggestions", () => {
                backend.setActionComponentFactory(Tables.ALIAS_SUGGESTIONS, undefined);
                expect(suggestions.setActionComponentFactory).toBeCalled();
            });
            test("official", () => {
                backend.setActionComponentFactory(Tables.ALIAS, undefined);
                expect(official.setActionComponentFactory).toBeCalled();
            });
            test("changes", () => {
                expect(() => backend.setActionComponentFactory(Tables.CHANGES, undefined)).toThrowError("matching")
            });
        });
    });
});