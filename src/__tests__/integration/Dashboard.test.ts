
import { Framework } from "$lib/controller/framework";
import { jest } from "@jest/globals";
import { fireEvent } from "@testing-library/dom";
import { ServerMock } from "./__setup__/serverMock";
import { BUTTON } from "./__setup__/constants";
import { clickOnButtonForRows, clickOnButtonForSomeRows, getAllRows } from "./__setup__/helpers";
import { matchers } from "./__setup__/matcher";
import render from "./__setup__/pageRenderer";
import { OpenFramework } from "./__setup__/__mocks__/OpenFramework";
import { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { AliasSuggestionsEntry } from "$lib/model/tables/suggestions/AliasSuggestions";
import { Alias } from "$lib/model/tables/official/OfficialAliases";

function amountBlacklist(n: number): string {
    return `Blacklist ${n}`;
}

function amountSuggestions(n: number): string {
    return `Alias-Vorschläge ${n}`;
}

function amountOfficial(n: number): string {
    return `Offizielle Aliase ${n}`;
}

expect.extend(matchers);

describe("Testing dashboard as user", () => {

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

    const originalWarn = console.warn.bind(console.warn)
    beforeAll(() => {
        console.warn = (msg) => !msg.toString().includes('prop') && originalWarn(msg)
    })
    afterAll(() => {
        console.warn = originalWarn
    })

    describe("accurate numbers", () => {

        beforeEach(async () => {
            serverMock.setBlacklist([]);
            serverMock.setSuggestions([]);
            serverMock.setOfficial([]);
            page = await render.dashboard();
        });

        describe.each([
            ["Blacklist", amountBlacklist, () => {
                serverMock.setBlacklist([
                    new BlacklistEntry("test"),
                    new BlacklistEntry("test1"),
                    new BlacklistEntry("test2"),
                    new BlacklistEntry("test3"),
                    new BlacklistEntry("test4"),
                    new BlacklistEntry("test5"),
                    new BlacklistEntry("test6"),
                ]);
                return serverMock.getBlacklist().length;
            }],
            ["Blacklist", amountBlacklist, () => {
                serverMock.setBlacklist([]);
                return serverMock.getBlacklist().length;
            }],
            ["Suggestion", amountSuggestions, () => {
                serverMock.setSuggestions([
                    new AliasSuggestionsEntry("test", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test1", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test2", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test3", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test4", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test5", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test6", "test", "-", 10, 42, 69, "tester"),
                ]);
                return serverMock.getSuggestions().length;
            }],
            ["Suggestion", amountSuggestions, () => {
                serverMock.setSuggestions([]);
                return serverMock.getSuggestions().length;
            }],
            ["Official", amountOfficial, () => {
                serverMock.setOfficial([
                    new Alias("test", "test", "-", 10),
                    new Alias("test1", "test", "-", 10),
                    new Alias("test2", "test", "-", 10),
                    new Alias("test3", "test", "-", 10),
                    new Alias("test4", "test", "-", 10),
                    new Alias("test5", "test", "-", 10),
                    new Alias("test6", "test", "-", 10),
                ]);
                return serverMock.getOfficial().length;
            }],
            ["Official", amountOfficial, () => {
                serverMock.setOfficial([]);
                return serverMock.getOfficial().length;
            }]
        ])("each category separate", (
            category: string,
            toString: (n: number) => string,
            setter: () => number
        ) => {
            
            test(category, async () => {
                let text = toString(setter());
                page = await render.dashboard();
                expect(page).toHaveTextContent(text);
            });
        });

        describe.each([
            ["Blacklist and Suggestions", () => {
                serverMock.setBlacklist([
                    new BlacklistEntry("test"),
                    new BlacklistEntry("test1"),
                    new BlacklistEntry("test2"),
                    new BlacklistEntry("test3"),
                    new BlacklistEntry("test4"),
                    new BlacklistEntry("test5"),
                    new BlacklistEntry("test6"),
                ]);
                serverMock.setSuggestions([
                    new AliasSuggestionsEntry("test", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test1", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test2", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test3", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test4", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test5", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test6", "test", "-", 10, 42, 69, "tester"),
                ]);
                return [
                    amountSuggestions(serverMock.getSuggestions().length),
                    amountOfficial(serverMock.getOfficial().length),
                    amountBlacklist(serverMock.getBlacklist().length)
                ];
            }],
            ["Blacklist and Official", () => {
                serverMock.setBlacklist([
                    new BlacklistEntry("test"),
                    new BlacklistEntry("test1"),
                    new BlacklistEntry("test2"),
                    new BlacklistEntry("test3"),
                    new BlacklistEntry("test5"),
                ]);
                serverMock.setOfficial([
                    new Alias("test", "test", "-", 10),
                    new Alias("test1", "test", "-", 10),
                    new Alias("test5", "test", "-", 10),
                    new Alias("test6", "test", "-", 10),
                ]);
                return [
                    amountSuggestions(serverMock.getSuggestions().length),
                    amountOfficial(serverMock.getOfficial().length),
                    amountBlacklist(serverMock.getBlacklist().length)
                ];
            }],
            ["Suggestion and Official", () => {
                serverMock.setSuggestions([
                    new AliasSuggestionsEntry("test", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test1", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test2", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test4", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test5", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test6", "test", "-", 10, 42, 69, "tester"),
                ]);
                serverMock.setOfficial([
                    new Alias("test", "test", "-", 10),
                    new Alias("test1", "test", "-", 10),
                    new Alias("test2", "test", "-", 10),
                    new Alias("test3", "test", "-", 10),
                    new Alias("test4", "test", "-", 10),
                    new Alias("test5", "test", "-", 10),
                    new Alias("test6", "test", "-", 10),
                ]);
                return [
                    amountSuggestions(serverMock.getSuggestions().length),
                    amountOfficial(serverMock.getOfficial().length),
                    amountBlacklist(serverMock.getBlacklist().length)
                ];
            }],
            ["Blacklist, Official and Suggestions", () => {
                serverMock.setOfficial([
                    new Alias("test", "test", "-", 10),
                    new Alias("test1", "test", "-", 10),
                    new Alias("test2", "test", "-", 10),
                    new Alias("test3", "test", "-", 10),
                    new Alias("test4", "test", "-", 10),
                    new Alias("test7", "test", "-", 10),
                    new Alias("test8", "test", "-", 10),
                    new Alias("test5", "test", "-", 10),
                    new Alias("test6", "test", "-", 10),
                ]);
                serverMock.setBlacklist([
                    new BlacklistEntry("test234"),
                    new BlacklistEntry("test23"),
                    new BlacklistEntry("test24"),
                    new BlacklistEntry("test2314"),
                    new BlacklistEntry("test1"),
                    new BlacklistEntry("test2"),
                    new BlacklistEntry("test3"),
                    new BlacklistEntry("test4"),
                    new BlacklistEntry("test5"),
                    new BlacklistEntry("test6"),
                ]);
                serverMock.setSuggestions([
                    new AliasSuggestionsEntry("test", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test1", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test2", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test3", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test4", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test5", "test", "-", 10, 42, 69, "tester6"),
                    new AliasSuggestionsEntry("test6", "test", "-", 10, 42, 69, "tester"),
                    new AliasSuggestionsEntry("test6", "test", "-", 10, 42, 69, "tester5"),
                    new AliasSuggestionsEntry("test6", "test", "-", 10, 42, 69, "tester1"),
                    new AliasSuggestionsEntry("test6", "test", "-", 10, 42, 69, "tester4"),
                ]);
                return [
                    amountSuggestions(serverMock.getSuggestions().length),
                    amountOfficial(serverMock.getOfficial().length),
                    amountBlacklist(serverMock.getBlacklist().length)
                ];
            }]
        ])("multiple categories simultaneously", (
            category: string,
            setter: () => [string, string, string]
        ) => {
            
            test(category, async () => {
                let texts = setter();
                page = await render.dashboard();
                texts.forEach(text => expect(page).toHaveTextContent(text));
            });
        });
    });
});