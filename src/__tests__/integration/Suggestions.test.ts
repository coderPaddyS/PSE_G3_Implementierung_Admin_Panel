
import { Framework } from "$lib/controller/framework";
import { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { jest } from "@jest/globals";
import { ServerMock } from "./__setup__/serverMock";
import { AliasSuggestionsEntry } from "$lib/model/tables/suggestions/AliasSuggestions";
import type { Alias } from "$lib/model/tables/official/OfficialAliases";
import { matchers } from "./__setup__/matcher";
import render from "./__setup__/pageRenderer";
import { clickOnButtonForRows, clickOnButtonForSomeRows, getAllRows, getFilters, setValueOfInput, toggleFilters } from "./__setup__/helpers";
import { BUTTON, FILTERS, INPUT } from "./__setup__/constants";
import timer from "./__setup__/logger";
class OpenFramework extends Framework {
    public constructor() {
        super();
    }
}

expect.extend(matchers);

describe("Testing interactions of suggestions as user", () => {

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
    
        console.warn = (msg) => !msg.toString().includes('prop') && originalWarn(msg);
    });

    afterAll(() => {
        console.warn = originalWarn
    });

    describe("a single entry", () => {

        const entry = new AliasSuggestionsEntry("Infobau", "50.34", "-", 503400000, 10, 0, "tester");
        beforeEach(async () => {
            serverMock.setBlacklist([]);
            serverMock.setOfficial([]);
            serverMock.setSuggestions([entry]);
            timer.start(" suggestions");
            page = await render.suggestion();
            timer.stop();
        });

        test("a single entry", async () => {
            expect(page).toHaveARow(serverMock.getSuggestions()[0].toDisplayData());
        });

        describe.each([
            ["decline", BUTTON.SUGGESTIONS.DELETE, [], [], []],
            ["blacklist", BUTTON.SUGGESTIONS.BLACKLIST, [], [new BlacklistEntry(entry.getName())], []],
            ["accept", BUTTON.SUGGESTIONS.ACCEPT, [], [], [entry.toAlias()]],
        ])("performing actions", (
            action: string, 
            actionIndex: number, 
            expectedSuggestions: AliasSuggestionsEntry[], 
            expectedBlacklist: BlacklistEntry[], 
            expectedOfficial: Alias[]) => {

            beforeEach(async () => {
                serverMock.setBlacklist([]);
                serverMock.setOfficial([]);
                serverMock.setSuggestions([entry]);
                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
            });

            test(action, async () => {
                expect(page).toHaveARow(entry.toDisplayData());
                clickOnButtonForRows(page, actionIndex);

                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
                expect(page).not.toHaveARow(entry.toDisplayData())

                timer.start(" changes");
                page = await render.changes();
                timer.stop();
                expect(page).toHaveARow(entry.toDisplayData())

                clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT)

                timer.start(" changes");
                page = await render.changes();
                timer.stop();
                expect(page).not.toHaveARow(entry.toDisplayData())
                expect(getAllRows(page).length).toBe(0);

                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
                expect(page).not.toHaveARow(entry.toDisplayData())
                expect(serverMock.getSuggestions()).toEqual(expectedSuggestions);
                expect(serverMock.getBlacklist()).toEqual(expectedBlacklist);
                expect(serverMock.getOfficial()).toEqual(expectedOfficial);
            });

            test(`is visible after cancelling of ${action}`, async () => {
                expect(page).toHaveARow(entry.toDisplayData())
                clickOnButtonForRows(page, actionIndex);

                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
                expect(page).not.toHaveARow(entry.toDisplayData())

                timer.start(" changes");
                page = await render.changes();
                timer.stop();
                expect(page).toHaveARow(entry.toDisplayData())

                clickOnButtonForRows(page, BUTTON.CHANGES.CANCEL)

                timer.start(" changes");
                page = await render.changes();
                timer.stop();
                expect(page).not.toHaveARow(entry.toDisplayData())
                expect(getAllRows(page).length).toBe(0);

                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
                expect(page).toHaveARow(entry.toDisplayData())
                expect(serverMock.getSuggestions()).toEqual([entry]);
                expect(serverMock.getBlacklist()).toEqual([]);
                expect(serverMock.getOfficial()).toEqual([]);
            });
        })
    });

    describe("multiple entries", () => {
        const entries = [
            new AliasSuggestionsEntry("Infobau", "50.34", "-", 503400000, 10, 0, "tester"),
            new AliasSuggestionsEntry("Mathebau", "20.30", "-", 203000000, 8, 1, "tester2"),
            new AliasSuggestionsEntry("Seminarraum", "50.34", "-108", 503499108, 11, 3, "tester3")
        ];

        beforeEach(async () => {
            serverMock.setBlacklist([]);
            serverMock.setOfficial([]);
            serverMock.setSuggestions([...entries]);
            timer.start(" suggestions");
            page = await render.suggestion();
            timer.stop();
        });

        test("all rendered", async () => {
            entries.forEach(e => expect(page).toHaveARow(e.toDisplayData()));
        });
        
        describe.each([
            ["decline", BUTTON.SUGGESTIONS.DELETE],
            ["blacklist", BUTTON.SUGGESTIONS.BLACKLIST],
            ["accept", BUTTON.SUGGESTIONS.ACCEPT],
        ])("performing actions", (
            action: string, 
            actionIndex: number, 
        ) => {

            beforeEach(async () => {
                serverMock.setBlacklist([]);
                serverMock.setOfficial([]);
                serverMock.setSuggestions([...entries]);
                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
            });

            test.each([
                [
                    [0], [1,2], [
                        [entries[1], entries[2]], [entries[1], entries[2]], [entries[1], entries[2]]
                    ], [
                        [], [new BlacklistEntry(entries[0].getName())], []
                    ], [
                        [], [], [entries[0].toAlias()]
                    ]
                ], [
                    [1], [0,2], [
                        [entries[0], entries[2]], [entries[0], entries[2]], [entries[0], entries[2]]
                    ], [
                        [], [new BlacklistEntry(entries[1].getName())], []
                    ], [
                        [], [], [entries[1].toAlias()]
                    ]
                ], [
                    [2], [0,1], [
                        [entries[0], entries[1]], [entries[0], entries[1]], [entries[0], entries[1]]
                    ], [
                        [], [new BlacklistEntry(entries[2].getName())], []
                    ], [
                        [], [], [entries[2].toAlias()]
                    ]
                ], [
                    [0,1], [2], [
                        [entries[2]], [entries[2]], [entries[2]]
                    ], [
                        [], [new BlacklistEntry(entries[0].getName()), new BlacklistEntry(entries[1].getName())], []
                    ], [
                        [], [], [entries[0].toAlias(), entries[1].toAlias()]
                    ]
                ], [
                    [0,2], [1], [
                        [entries[1]], [entries[1]], [entries[1]]
                    ], [
                        [], [new BlacklistEntry(entries[0].getName()), new BlacklistEntry(entries[2].getName())], []
                    ], [
                        [], [], [entries[0].toAlias(), entries[2].toAlias()]
                    ], 
                ], [
                    [1,2], [0], [
                        [entries[0]], [entries[0]], [entries[0]]
                    ], [
                        [], [new BlacklistEntry(entries[1].getName()), new BlacklistEntry(entries[2].getName())], []
                    ], [
                        [], [], [entries[1].toAlias(), entries[2].toAlias()]
                    ]
                ], [
                    [0,1,2], [], [
                        [], [], []
                    ], [
                        [], [new BlacklistEntry(entries[0].getName()), new BlacklistEntry(entries[1].getName()), new BlacklistEntry(entries[2].getName())], []
                    ], [
                        [], [], [entries[0].toAlias(), entries[1].toAlias(), entries[2].toAlias()]
                    ]
                ]
            ])(action, async (
                affected: number[],
                notAffected: number[],
                expectedSuggestions: AliasSuggestionsEntry[][],
                expectedBlacklist: BlacklistEntry[][],
                expectedOfficial: Alias[][]
            ) => {
                expect(page).toHaveAllRows(entries);
                clickOnButtonForSomeRows(page, affected, actionIndex);

                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();

                expect(page).not.toHaveSomeRows(affected, entries);
                expect(page).toHaveSomeRows(notAffected, entries);

                timer.start(" changes");
                page = await render.changes();
                timer.stop();

                expect(page).toHaveSomeMetadata(affected, entries);

                clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);

                timer.start(" changes");
                page = await render.changes();
                timer.stop();
                expect(page).not.toHaveSomeMetadata(affected, entries);
                expect(getAllRows(page).length).toBe(0);

                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
                expect(page).not.toHaveSomeRows(affected, entries);
                expect(page).toHaveSomeRows(notAffected, entries);
                expect(serverMock.getSuggestions()).toEqual(expectedSuggestions[actionIndex]);
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

                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
                expect(page).not.toHaveSomeRows(affected, entries);
                expect(page).toHaveSomeRows(notAffected, entries)

                timer.start(" changes");
                page = await render.changes();
                timer.stop();
                expect(page).toHaveSomeMetadata(affected, entries);

                clickOnButtonForRows(page, BUTTON.CHANGES.CANCEL);

                timer.start(" changes");
                page = await render.changes();
                timer.stop();
                expect(page).not.toHaveSomeMetadata(affected, entries)
                expect(getAllRows(page).length).toBe(0);

                timer.start(" suggestions");
                page = await render.suggestion();
                timer.stop();
                expect(page).toHaveAllRows(entries);
                expect(serverMock.getSuggestions()).toEqual(entries);
                expect(serverMock.getBlacklist()).toEqual([]);
                expect(serverMock.getOfficial()).toEqual([]);
            });
        });
    });

    describe("testing behavior on blacklisted terms", () => {

        const blacklist = [
            new BlacklistEntry("Depp"),
            new BlacklistEntry("Idiot")
        ];

        const entries = [
            new AliasSuggestionsEntry("Infobau", "50.34", "-", 503400000, 10, 0, "tester"),
            new AliasSuggestionsEntry("Mathebau", "20.30", "-", 203000000, 8, 1, "tester2"),
            new AliasSuggestionsEntry("Seminarraum", "50.34", "-108", 503499108, 11, 3, "tester3"),
            new AliasSuggestionsEntry("Depp", "50.34", "-108", 503499108, 0, 45, "tester4"),
            new AliasSuggestionsEntry("Idiot", "50.34", "-108", 503499108, 0, 50, "tester5"),
        ];

        beforeEach(async () => {
            serverMock.setOfficial([]);
            serverMock.setBlacklist([...blacklist]);
            serverMock.setSuggestions([...entries]);
            page = await render.suggestion();
        });

        test.each([
            [[3,4]]
        ])(`blacklisting`, async (affected: number[]) => {
            expect(page).toHaveAllRows(entries);
            clickOnButtonForSomeRows(page, affected, BUTTON.SUGGESTIONS.BLACKLIST);

            page = await render.changes();
            expect(page).toHaveSomeMetadata(affected, entries);
            clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);

            page = await render.suggestion();
            expect(page).not.toHaveSomeRows(affected, entries);

            expect(serverMock.getBlacklist()).toEqual(blacklist);
            expect(serverMock.getOfficial()).toEqual([]);
        });

        test.each([
            [[3,4]]
        ])(`cannot accept blacklisted`, async (affected: number[]) => {
            page = await render.blacklist();
            page = await render.suggestion();
            expect(page).toHaveAllRows(entries);
            clickOnButtonForSomeRows(page, affected, BUTTON.SUGGESTIONS.ACCEPT);

            page = await render.changes();
            expect(page).toHaveSomeMetadata(affected, entries);
            clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);

            page = await render.suggestion();
            expect(page).not.toHaveSomeRows(affected, entries);

            expect(serverMock.getBlacklist()).toEqual(blacklist);
            expect(serverMock.getOfficial()).toEqual([]);
        });
    });

    describe("testing filtering", () => {

        const entries = [
            new AliasSuggestionsEntry("Infobau", "50.34", "-", 503400000, 10, 0, "tester"),
            new AliasSuggestionsEntry("Mathebau", "20.30", "-", 203000000, 8, 1, "tester2"),
            new AliasSuggestionsEntry("Seminarraum", "50.34", "-108", 503499108, 11, 3, "tester3"),
            new AliasSuggestionsEntry("Depp", "50.34", "-108", 503499108, 0, 45, "tester4"),
            new AliasSuggestionsEntry("Idiot", "50.34", "-108", 503499108, 0, 50, "tester5"),
        ];

        beforeEach(async () => {
            serverMock.setOfficial([]);
            serverMock.setBlacklist([]);
            serverMock.setSuggestions([...entries]);
            page = await render.suggestion();
        });

        test.each([
            [[0,0, 2, 2], [0,1,2,3,4], [2]],
            [[1,1, 2, 2], [1,2], [2]],
        ])("on-site filtering", async (
            [settingsPos, settingsNeg, filterPos, filterNeg],
            expectedAfterSettings,
            expectedAfterFiltering
        ) => {
            expect(page).toHaveAllRows(entries);

            page = await render.settings();
            await setValueOfInput(page, INPUT.SETTINGS.MIN_POSITIVE_SUGGESTION, settingsPos);
            await setValueOfInput(page, INPUT.SETTINGS.MIN_NEGATIVE_SUGGESTION, settingsNeg);

            page = await render.suggestion();
            expect(page).toHaveSomeRows(expectedAfterSettings, entries);
            expect(getAllRows(page).length).toBe(expectedAfterSettings.length);

            await toggleFilters(getFilters(page));
            await setValueOfInput(getFilters(page), FILTERS.SUGGESTIONS.UPVOTES, filterPos);
            await setValueOfInput(getFilters(page), FILTERS.SUGGESTIONS.DOWNVOTES, filterNeg);
            expect(page).toHaveSomeRows(expectedAfterFiltering, entries);
            expect(getAllRows(page).length).toBe(expectedAfterFiltering.length);
        })
    });
});