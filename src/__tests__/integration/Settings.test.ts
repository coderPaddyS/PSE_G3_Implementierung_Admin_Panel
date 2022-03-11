
import { Framework } from "$lib/controller/framework";
import { jest } from "@jest/globals";
import { ServerMock } from "./__setup__/serverMock";
import { AliasSuggestionsEntry } from "$lib/model/tables/suggestions/AliasSuggestions";
import { matchers } from "./__setup__/matcher";
import render from "./__setup__/pageRenderer";
import { setValueOfInput } from "./__setup__/helpers";
import { INPUT } from "./__setup__/constants";

class OpenFramework extends Framework {
    public constructor() {
        super();
    }
}

expect.extend(matchers);

describe("Testing interactions of settings as user", () => {

    const entries = [
        new AliasSuggestionsEntry("Infobau", "50.34", "-", 503400000, 10, 0, "tester"),
        new AliasSuggestionsEntry("Mathebau", "20.30", "-", 203000000, 8, 1, "tester2"),
        new AliasSuggestionsEntry("Seminarraum", "50.34", "-108", 503499108, 11, 3, "tester3"),
        new AliasSuggestionsEntry("HSaF", "50.36", "-", 503600000, 1, 2, "tester4"),
        new AliasSuggestionsEntry("Hörsaal am Fasanen", "50.36", "-", 503600000, 0, 7, "tester3")  
    ];

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

    describe("setting value", () => {

        beforeEach(async () => {
            serverMock.setBlacklist([]);
            serverMock.setOfficial([]);
            serverMock.setSuggestions([...entries]);
            page = await render.settings();
            await setValueOfInput(page, INPUT.SETTINGS.MIN_POSITIVE_SUGGESTION, 0);
            await setValueOfInput(page, INPUT.SETTINGS.MIN_NEGATIVE_SUGGESTION, 0);
        });

        test.each([
            [0, [0,1,2,3,4], []],
            [-1, [0,1,2,3,4], []],
            [1, [0,1,2,3], [4]],
            [10, [0,2], [1,3,4]],
            [42, [], [0,1,2,3,4]]
        ])(`upvotes`, async (value: number, shown: number[], notShown: number[]) => {
            page = await render.suggestion();
            expect(page).toHaveAllRows(entries);

            page = await render.settings();
            await setValueOfInput(page, INPUT.SETTINGS.MIN_POSITIVE_SUGGESTION, value);

            page = await render.suggestion();
            if (shown.length > 0) {
                expect(page).toHaveSomeRows(shown, entries);
            }
            if (notShown.length > 0) {
                expect(page).not.toHaveSomeRows(notShown, entries);
            }
            expect(serverMock.getSuggestions()).toEqual(entries);
        });

        test.each([
            [0, [0,1,2,3,4], []],
            [-1, [0,1,2,3,4], []],
            [1, [1,2,3,4], [0]],
            [5, [4], [0,1,2,3]],
            [42, [], [0,1,2,3,4]]
        ])(`downvotes`, async (value: number, shown: number[], notShown: number[]) => {
            page = await render.suggestion();
            expect(page).toHaveAllRows(entries);

            page = await render.settings();
            await setValueOfInput(page, INPUT.SETTINGS.MIN_NEGATIVE_SUGGESTION, value);

            page = await render.suggestion();
            if (shown.length > 0) {
                expect(page).toHaveSomeRows(shown, entries);
            }
            if (notShown.length > 0) {
                expect(page).not.toHaveSomeRows(notShown, entries);
            }
            expect(serverMock.getSuggestions()).toEqual(entries);
        });

        test.each([
            [1, -1, [0,1,2,3], [4]],
            [4, 3, [2], [0,1,3,4]],
            [1, 1, [1,2,3], [0,4]],
            [-5, -8, [0,1,2,3,4], []],
            [42, 69, [], [0,1,2,3,4]]
        ])(`both`, async (upvotes: number, downvotes: number, shown: number[], notShown: number[]) => {
            page = await render.suggestion();
            expect(page).toHaveAllRows(entries);

            page = await render.settings();
            await setValueOfInput(page, INPUT.SETTINGS.MIN_POSITIVE_SUGGESTION, upvotes);
            await setValueOfInput(page, INPUT.SETTINGS.MIN_NEGATIVE_SUGGESTION, downvotes);

            page = await render.suggestion();
            if (shown.length > 0) {
                expect(page).toHaveSomeRows(shown, entries);
            }
            if (notShown.length > 0) {
                expect(page).not.toHaveSomeRows(notShown, entries);
            }
            expect(serverMock.getSuggestions()).toEqual(entries);
        });
    });
});