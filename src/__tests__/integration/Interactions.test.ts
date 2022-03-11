
import { Framework } from "$lib/controller/framework";
import { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { jest } from "@jest/globals";
import { ServerMock } from "./__setup__/serverMock";
import { BUTTON } from "./__setup__/constants";
import { clickOnButtonForRows, clickOnButtonForSomeRows, getAllRows } from "./__setup__/helpers";
import { matchers } from "./__setup__/matcher";
import render from "./__setup__/pageRenderer";
import { OpenFramework } from "./__setup__/__mocks__/OpenFramework";
import { Alias } from "$lib/model/tables/official/OfficialAliases";
import { AliasSuggestionsEntry } from "$lib/model/tables/suggestions/AliasSuggestions";
import timer from "./__setup__/logger"

expect.extend(matchers);

type BlacklistAction = [index: number, action: number] | [];
type SuggestionsAction = [index: number, action: number] | [];
type OfficialAction = [index: number, action: number] | [];
type ChangesAction = [index: number, action: number] | [];
type expectedEntries = [
    blacklistEntries: BlacklistEntry[],
    suggestionsEntries: AliasSuggestionsEntry[],
    officialEntries: Alias[],
    changes: [
        blacklistEntries: BlacklistEntry[], 
        suggestionsEntries: AliasSuggestionsEntry[], 
        officialEntries: Alias[]
    ]
]
type interactionStep = [
    [
        BlacklistAction[],
        SuggestionsAction[],
        OfficialAction[],
        ChangesAction[]
    ], 
    expectedEntries
]
type interaction = Array<interactionStep>

describe("Testing normal interactions as user", () => {

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
    });

    const originalWarn = console.warn.bind(console.warn);
    beforeAll(() => {
        console.warn = (msg) => !msg.toString().includes('prop') && originalWarn(msg);
    })
    afterAll(() => {
        console.warn = originalWarn;
    });

    const blacklist = [
        new BlacklistEntry("Arsch"),
        new BlacklistEntry("Penner"),
        new BlacklistEntry("Hölle")
    ];

    const official = [
        new Alias("Infobau", "50.34", "-", 503400000),
        new Alias("Mathebau", "20.30", "-", 203000000),
        new Alias("Seminarraum", "50.34", "-108", 503499108),
    ];

    const suggestions = [
        new AliasSuggestionsEntry("Seminarraum", "50.34", "-107", 503499107, 10, 1, "tester"),
        new AliasSuggestionsEntry("HSaF", "50.36", "-", 503600000, 25, 0, "tester"),
        new AliasSuggestionsEntry("Depp", "50.34", "-196", 503499196, 0, 15, "tester2"),
    ];

    describe("with multiple steps", () => {

        beforeEach(() => {
            serverMock.setBlacklist([...blacklist]);
            serverMock.setOfficial([...official]);
            serverMock.setSuggestions([...suggestions]);
        });

        const interactions: interaction[][] = [
            [
                [
                    [
                        [
                            [
                                [0, BUTTON.BLACKLIST.DELETE]
                            ], [
                                [0, BUTTON.SUGGESTIONS.DELETE]
                            ], [
                                [0, BUTTON.OFFICIAL.DELETE]
                            ], [
                                [0, BUTTON.CHANGES.ACCEPT],
                                [1, BUTTON.CHANGES.CANCEL]
                            ]
                        ], [
                            [blacklist[1], blacklist[2]], [...suggestions], [official[1], official[2]], [
                                [], [], [official[0]]
                            ]
                        ]
                    ], [
                        [
                            [], [], [
                                [0, BUTTON.OFFICIAL.DELETE]
                            ], [
                                [0, BUTTON.CHANGES.ACCEPT],
                                [1, BUTTON.CHANGES.ACCEPT]
                            ]
                        ], [
                            [blacklist[1], blacklist[2]], [...suggestions], [official[2]], [
                                [], [], []
                            ]
                        ]
                    ]
                ]
            ], 
            [
                [
                    [
                        [
                            [
                                
                            ], [
                                [0, BUTTON.SUGGESTIONS.DELETE]
                            ], [
                                [0, BUTTON.OFFICIAL.DELETE]
                            ], [
                                [0, BUTTON.CHANGES.ACCEPT],
                                [1, BUTTON.CHANGES.CANCEL]
                            ]
                        ], [
                            [...blacklist], [suggestions[1], suggestions[2]], [...official], [
                                [], [], []
                            ]
                        ]
                    ], [
                        [
                            [], [], [
                                [0, BUTTON.OFFICIAL.DELETE],
                                [1, BUTTON.OFFICIAL.DELETE],
                            ], [
                                [0, BUTTON.CHANGES.ACCEPT],
                                [1, BUTTON.CHANGES.ACCEPT]
                            ]
                        ], [
                            [...blacklist], [suggestions[1], suggestions[2]], [official[2]], [
                                [], [], []
                            ]
                        ]
                    ]
                ]
            ], 
            [
                [
                    [
                        [
                            [
                                [2, BUTTON.BLACKLIST.DELETE]
                            ], [
                                [2, BUTTON.SUGGESTIONS.DELETE],
                                [1, BUTTON.SUGGESTIONS.ACCEPT],
                            ], [
                                [1, BUTTON.OFFICIAL.BLACKLIST]
                            ], [
                                [0, BUTTON.CHANGES.ACCEPT],
                                [1, BUTTON.CHANGES.ACCEPT]
                            ]
                        ], [
                            [blacklist[0], blacklist[1]], [suggestions[0]], [official[0], official[2]], [
                                [], [suggestions[1]], [official[1]]
                            ]
                        ]
                    ]
                ], 
                [
                    [
                        [
                            [
                                [1, BUTTON.BLACKLIST.DELETE]
                            ], [
                                [0, BUTTON.SUGGESTIONS.DELETE],
                            ], [ ], [
                                [0, BUTTON.CHANGES.ACCEPT],
                                [1, BUTTON.CHANGES.ACCEPT]
                            ]
                        ], [
                            [blacklist[0], new BlacklistEntry(official[1].getName())], [], [official[0], official[2], suggestions[1].toAlias()], [
                                [blacklist[1]], [suggestions[0]], []
                            ]
                        ]
                    ]
                ],
                [
                    [
                        [
                            [
                                [0, BUTTON.BLACKLIST.DELETE]
                            ], [ ], [
                                [2, BUTTON.OFFICIAL.BLACKLIST]
                            ], [
                                [0, BUTTON.CHANGES.ACCEPT],
                                [1, BUTTON.CHANGES.ACCEPT],
                                [2, BUTTON.CHANGES.ACCEPT],
                                [3, BUTTON.CHANGES.ACCEPT],
                            ]
                        ], [
                            [new BlacklistEntry(official[1].getName()), new BlacklistEntry(suggestions[1].getName())], [], [official[0], official[2]], [
                                [], [], []
                            ]
                        ]
                    ]
                ]
            ],
        ]

        test.each([
            ...interactions
        ])("interaction", async (steps: interaction) => {
            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(page).toHaveAllRows(blacklist);
            
            timer.start("suggestion");
            page = await render.suggestion();
            timer.stop();
            expect(page).toHaveAllRows(suggestions);

            timer.start("official");
            page = await render.official();
            timer.stop();
            expect(page).toHaveAllRows(official);

            for (let step of steps) {
                let [[
                    blacklistActions,
                    suggestionsActions,
                    officialActions,
                    changesActions
                ], [
                    expBlacklist, 
                    expSuggestions, 
                    expOfficial, 
                    expChanges
                ]] = step;

                timer.start("blacklist");
                page = await render.blacklist();
                timer.stop();
                let indicesBlacklist = blacklistActions.map(([index, action]) => {
                    clickOnButtonForSomeRows(page, [index], action);
                    return index;
                });

                timer.start("blacklist");
                page = await render.blacklist();
                timer.stop();
                if (indicesBlacklist.length > 0) {
                    expect(page).not.toHaveSomeRows(indicesBlacklist, blacklist);
                }

                timer.start("suggestion");
                page = await render.suggestion();
                timer.stop();
                let indicesSuggestion = suggestionsActions.map(([index, action]) => {
                    clickOnButtonForSomeRows(page, [index], action);
                    return index;
                });

                timer.start("suggestion");
                page = await render.suggestion();
                timer.stop();
                if (indicesSuggestion.length > 0) {
                    expect(page).not.toHaveSomeRows(indicesSuggestion, suggestions);
                }

                timer.start("official");
                page = await render.official();
                timer.stop();
                let indicesOfficial = officialActions.map(([index, action]) => {
                    clickOnButtonForSomeRows(page, [index], action);
                    return index;
                });

                timer.start("official");
                page = await render.official();
                timer.stop();
                if (indicesOfficial.length > 0) {
                    expect(page).not.toHaveSomeRows(indicesOfficial, official);
                }

                timer.start("changes");
                page = await render.changes();
                timer.stop();
                changesActions.forEach(([index, action]) => {
                    clickOnButtonForSomeRows(page, [index], action);
                    return index;
                });

                timer.start("changes");
                page = await render.changes();
                let [blacklistMetadata, suggestionsMetadata, officialMetdata] = expChanges;
                if (blacklistMetadata.length > 0) {
                    expect(page).toHaveAllMetadata(blacklistMetadata);
                }
                if (suggestionsMetadata.length > 0) {
                    expect(page).toHaveAllMetadata(suggestionsMetadata);
                }
                if (officialMetdata.length > 0) {
                    expect(page).toHaveAllMetadata(officialMetdata);
                }
                
                timer.start("blacklist");
                page = await render.blacklist();
                timer.stop();
                expect(page).toHaveAllRows(expBlacklist);
                expect(serverMock.getBlacklist().length).toBe(expBlacklist.length + blacklistMetadata.length);

                timer.start("official");
                page = await render.official();
                timer.stop();
                expect(page).toHaveAllRows(expOfficial);
                expect(serverMock.getOfficial().length).toBe(expOfficial.length + officialMetdata.length);

                timer.start("suggestion");
                page = await render.suggestion();
                timer.stop();
                expect(page).toHaveAllRows(expSuggestions);
                expect(serverMock.getSuggestions().length).toBe(expSuggestions.length + suggestionsMetadata.length);
            }
        });
    });
});