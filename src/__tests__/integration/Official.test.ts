import { Framework } from "$lib/controller/framework";
import { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { Alias } from "$lib/model/tables/official/OfficialAliases";
import type { AliasSuggestionsEntry } from "$lib/model/tables/suggestions/AliasSuggestions";
import { BUTTON } from "./__setup__/constants";
import { clickOnButtonForRows, clickOnButtonForSomeRows, getAllRows } from "./__setup__/helpers";
import { matchers } from "./__setup__/matcher";
import { OpenFramework } from "./__setup__/__mocks__/OpenFramework";
import render from "./__setup__/pageRenderer";
import { ServerMock } from "./__setup__/serverMock";

expect.extend(matchers);


describe("expect official aliases to be rendered", () => {

    const originalWarn = console.warn.bind(console.warn)
    let page: HTMLElement;

    let framework: OpenFramework;
    let serverMock: ServerMock;
    let fetchBackend: (body: string) => Promise<any>;

    beforeAll(() => {
        serverMock = new ServerMock([], [], []);
        fetchBackend = serverMock.getFetchBackendMock();
        framework = new OpenFramework();
        Framework['instance'] = framework;
        framework['backend']['fetchBackend'] = fetchBackend;
    
        console.warn = (msg) => !msg.toString().includes('prop') && originalWarn(msg)
    });

    afterAll(() => {
        console.warn = originalWarn
    });

    describe("a single entry", () => {

        const entry = new Alias("Infobau", "50.34", "-", 503400000);
        beforeEach(async () => {
            serverMock.setBlacklist([]);
            serverMock.setSuggestions([]);
            serverMock.setOfficial([entry]);
            page = await render.official();
        });

        test("a single entry", async () => {
            expect(page).toHaveARow(entry.toDisplayData());
        });

        describe.each([
            ["decline", 0, [], [], []],
            ["blacklist", 1, [], [new BlacklistEntry(entry.getName())], []]
        ])("performing actions", (
            action: string, 
            actionIndex: number, 
            expectedSuggestions: AliasSuggestionsEntry[], 
            expectedBlacklist: BlacklistEntry[], 
            expectedOfficial: Alias[]) => {

            beforeEach(async () => {
                serverMock.setBlacklist([]);
                serverMock.setSuggestions([]);
                serverMock.setOfficial([entry]);
                page = await render.official();
            });

            test(action, async () => {
                expect(page).toHaveARow(entry.toDisplayData());
                clickOnButtonForRows(page, actionIndex);

                page = await render.official();
                expect(page).not.toHaveARow(entry.toDisplayData());

                page = await render.changes();
                expect(page).toHaveMetadata(entry.toDisplayData());

                clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);

                page = await render.changes();
                expect(page).not.toHaveMetadata(entry.toDisplayData());
                expect(getAllRows(page).length).toBe(0);

                page = await render.official();
                expect(page).not.toHaveARow(entry.toDisplayData());
                expect(serverMock.getSuggestions()).toEqual(expectedSuggestions);
                expect(serverMock.getBlacklist()).toEqual(expectedBlacklist);
                expect(serverMock.getOfficial()).toEqual(expectedOfficial);
            });

            test(action, async () => {
                expect(page).toHaveARow(entry.toDisplayData());
                clickOnButtonForRows(page, actionIndex);

                page = await render.official();
                expect(page).not.toHaveARow(entry.toDisplayData());

                page = await render.changes();
                expect(page).toHaveMetadata(entry.toDisplayData());

                clickOnButtonForRows(page, BUTTON.CHANGES.CANCEL);

                page = await render.changes();
                expect(page).not.toHaveMetadata(entry.toDisplayData());
                expect(getAllRows(page).length).toBe(0);

                page = await render.official();
                expect(page).toHaveARow(entry.toDisplayData());
                expect(serverMock.getSuggestions()).toEqual([]);
                expect(serverMock.getBlacklist()).toEqual([]);
                expect(serverMock.getOfficial()).toEqual([entry]);
            });
        })
    });

    describe("multiple entries", () => {
        const entries = [
            new Alias("Infobau", "50.34", "-", 503400000),
            new Alias("Mathebau", "20.30", "-", 203000000),
            new Alias("Seminarraum", "50.34", "-108", 503499108)
        ];

        beforeEach(async () => {
            serverMock.setBlacklist([]);
            serverMock.setSuggestions([]);
            serverMock.setOfficial([...entries]);
            page = await render.official();
        });

        test("all rendered", async () => {
            expect(page).toHaveAllRows(entries);
        });
        
        describe.each([
            ["decline", BUTTON.OFFICIAL.DELETE],
            ["blacklist", BUTTON.OFFICIAL.BLACKLIST]
        ])("performing actions", (
            action: string, 
            actionIndex: number, 
        ) => {

            beforeEach(async () => {
                serverMock.setBlacklist([]);
                serverMock.setSuggestions([]);
                serverMock.setOfficial([...entries]);
                page = await render.official();
            });

            test.each([
                [
                    [0], [1,2], [
                        [entries[1], entries[2]], [entries[1], entries[2]]
                    ], [
                        [], [new BlacklistEntry(entries[0].getName())]
                    ]
                ], [
                    [1], [0,2], [
                        [entries[0], entries[2]], [entries[0], entries[2]]
                    ], [
                        [], [new BlacklistEntry(entries[1].getName())]
                    ]
                ], [
                    [2], [0,1], [
                        [entries[0], entries[1]], [entries[0], entries[1]]
                    ], [
                        [], [new BlacklistEntry(entries[2].getName())]
                    ]
                ], [
                    [0,1], [2], [
                        [entries[2]], [entries[2]]
                    ], [
                        [], [new BlacklistEntry(entries[0].getName()), new BlacklistEntry(entries[1].getName())],
                    ]
                ], [
                    [0,2], [1], [
                        [entries[1]], [entries[1]]
                    ], [
                        [], [new BlacklistEntry(entries[0].getName()), new BlacklistEntry(entries[2].getName())]
                    ]
                ], [
                    [1,2], [0], [
                        [entries[0]], [entries[0]]
                    ], [
                        [], [new BlacklistEntry(entries[1].getName()), new BlacklistEntry(entries[2].getName())]
                    ]
                ], [
                    [0,1,2], [], [
                        [], []
                    ], [
                        [], [new BlacklistEntry(entries[0].getName()), new BlacklistEntry(entries[1].getName()), new BlacklistEntry(entries[2].getName())]
                    ]
                ]
            ])(action, async (
                affected: number[],
                notAffected: number[],
                expectedOfficial: Alias[][],
                expectedBlacklist: BlacklistEntry[][],
            ) => {
                expect(page).toHaveAllRows(entries);
                clickOnButtonForSomeRows(page, affected, actionIndex);

                page = await render.official();
                
                expect(page).not.toHaveSomeRows(affected, entries);
                expect(page).toHaveSomeRows(notAffected, entries);

                page = await render.changes();
                expect(page).toHaveSomeMetadata(affected, entries);

                clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);

                page = await render.changes();
                expect(page).not.toHaveSomeMetadata(affected, entries);
                expect(getAllRows(page).length).toBe(0);

                page = await render.official();
                expect(page).not.toHaveSomeRows(affected, entries);
                expect(page).toHaveSomeRows(notAffected, entries);
                expect(serverMock.getSuggestions()).toEqual([]);
                expect(serverMock.getBlacklist()).toEqual(expectedBlacklist[actionIndex]);
                expect(serverMock.getOfficial()).toEqual(expectedOfficial[actionIndex]);
            });

            test.each([
                [
                    [0], [1,2]
                ], [
                    [1], [0,2]
                ], [
                    [2], [0,1]
                ], [
                    [0,1], [2]
                ], [
                    [0,2], [1]
                ], [
                    [1,2], [0]
                ], [
                    [0,1,2], []
                ]
            ])(`is visible after cancelling of ${action}`, async (
                affected: number[],
                notAffected: number[]
            ) => {
                expect(page).toHaveAllRows(entries);
                clickOnButtonForSomeRows(page, affected, actionIndex);

                page = await render.official();
                expect(page).not.toHaveSomeRows(affected, entries);
                expect(page).toHaveSomeRows(notAffected, entries);

                page = await render.changes();
                expect(page).toHaveSomeMetadata(affected, entries);

                clickOnButtonForRows(page, BUTTON.CHANGES.CANCEL);

                page = await render.changes();
                expect(page).not.toHaveSomeMetadata(affected, entries);
                expect(getAllRows(page).length).toBe(0);

                page = await render.official();
                expect(page).toHaveAllRows(entries);
                expect(serverMock.getBlacklist()).toEqual([]);
                expect(serverMock.getSuggestions()).toEqual([]);
            });
        });
    });
});