
import { Framework } from "$lib/controller/framework";
import { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { jest } from "@jest/globals";
import { ServerMock } from "./__setup__/serverMock";
import { BUTTON } from "./__setup__/constants";
import { addEntry, clickOnButtonForRows, clickOnButtonForSomeRows, getAdder, getAllRows } from "./__setup__/helpers";
import { matchers } from "./__setup__/matcher";
import render from "./__setup__/pageRenderer";
import { OpenFramework } from "./__setup__/__mocks__/OpenFramework";
import timer from "./__setup__/logger";

expect.extend(matchers);

describe("Testing interactions of blacklist as user", () => {

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

    beforeEach(() => {
        serverMock.setBlacklist([]);
    });

    describe("a single entry", () => {

        const entry = new BlacklistEntry("seggs");

        beforeEach(async () => {
            serverMock.setBlacklist([entry]);
            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
        });

        test("renders correctly", async () => {
            expect(page).toHaveAllRows([entry]);
            expect(getAllRows(page).length).toBe(serverMock.getBlacklist().length);
        });

        test("can be removed", async () => {
            expect(page).toHaveAllRows([entry]);
            clickOnButtonForRows(page, BUTTON.BLACKLIST.DELETE);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(page).not.toHaveAllRows([entry]);
            
            timer.start("changes");
            page = await render.changes();
            timer.stop();
            expect(getAllRows(page).length).toBe(1);
            expect(page).toHaveAllMetadata([entry]);

            clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);
            
            timer.start("changes");
            page = await render.changes();
            timer.stop();
            expect(getAllRows(page).length).toBe(0);
            expect(serverMock.getBlacklist().length).toBe(0);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(page).not.toHaveAllRows([entry]);
        });

        test("is visible after abortion of change", async () => {
            expect(page).toHaveAllRows([entry]);
            clickOnButtonForRows(page, BUTTON.BLACKLIST.DELETE);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(page).not.toHaveAllRows([entry]);

            timer.start("changes");
            page = await render.changes();
            timer.stop();
            expect(getAllRows(page).length).toBe(1);
            expect(page).toHaveAllMetadata([entry]);

            clickOnButtonForRows(page, BUTTON.CHANGES.CANCEL);
            
            timer.start("changes");
            page = await render.changes();
            timer.stop();
            expect(getAllRows(page).length).toBe(0);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(page).toHaveAllRows([entry]);
            expect(serverMock.getBlacklist().length).toBe(1);
        });
    });

    describe("multiple entries", () => {

        beforeEach(async () => {
            serverMock.setBlacklist([new BlacklistEntry("seggs"), new BlacklistEntry("penis"), new BlacklistEntry("arsch")]);
            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
        });

        test("renders correctly", () => {
            expect(page).toHaveAllRows(serverMock.getBlacklist())
            expect(getAllRows(page).length).toBe(serverMock.getBlacklist().length);
        });

        test.each([
            [[0], [1,2]],
            [[1], [0,2]],
            [[2], [0,1]],
            [[0,1], [2]],
            [[1,2], [0]],
            [[0,2], [1]],
            [[0,1,2], []]
        ])("can be removed", async (toRemove: number[], alwaysVisible: number[]) => {
            let visibleEntries = alwaysVisible.map(index => serverMock.getBlacklist()[index].toDisplayData()[0]);
            let removedEntries = toRemove.map(index => serverMock.getBlacklist()[index].toDisplayData()[0]);
            clickOnButtonForSomeRows(page, toRemove, BUTTON.BLACKLIST.DELETE);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(page).toHaveSomeRows(alwaysVisible, serverMock.getBlacklist());
            expect(page).not.toHaveSomeRows(toRemove, serverMock.getBlacklist());

            timer.start("changes");
            page = await render.changes();
            timer.stop();
            expect(page).toHaveSomeMetadata(toRemove, serverMock.getBlacklist());
            expect(getAllRows(page).length).toBe(toRemove.length);

            clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);

            timer.start("changes");
            page = await render.changes();
            timer.stop();
            expect(page).not.toHaveSomeMetadata(toRemove, serverMock.getBlacklist());
            expect(getAllRows(page).length).toBe(0);
            expect(serverMock.getBlacklist().length).toBe(alwaysVisible.length);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(getAllRows(page).length).toBe(serverMock.getBlacklist().length);

            expect(page).toHaveAllRows(visibleEntries);
            expect(page).not.toHaveAllRows(removedEntries);
        });

        test.each([
            [[0], [1,2]],
            [[1], [0,2]],
            [[2], [0,1]],
            [[0,1], [2]],
            [[1,2], [0]],
            [[0,2], [1]],
            [[0,1,2], []]
        ])("is visible after abortion of action", async (toRemove: number[], alwaysVisible: number[]) => {
            clickOnButtonForSomeRows(page, toRemove, BUTTON.BLACKLIST.DELETE);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(page).toHaveSomeRows(alwaysVisible, serverMock.getBlacklist());
            expect(page).not.toHaveSomeRows(toRemove, serverMock.getBlacklist());

            timer.start("changes");
            page = await render.changes();
            timer.stop();
            expect(page).toHaveSomeMetadata(toRemove, serverMock.getBlacklist());
            expect(getAllRows(page).length).toBe(toRemove.length);

            clickOnButtonForRows(page, BUTTON.CHANGES.CANCEL);
            
            timer.start("changes");
            page = await render.changes();
            timer.stop();
            expect(getAllRows(page).length).toBe(0);
            expect(page).not.toHaveSomeMetadata(toRemove, serverMock.getBlacklist());
            expect(serverMock.getBlacklist().length).toBe(toRemove.length + alwaysVisible.length);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(getAllRows(page).length).toBe(serverMock.getBlacklist().length);
            expect(page).toHaveAllRows(serverMock.getBlacklist())
        });
    });

    describe("addEntry", () => {

        const entries = [new BlacklistEntry("seggs"), new BlacklistEntry("penis"), new BlacklistEntry("arsch")]
    
        beforeEach(async () => {
            serverMock.setBlacklist([...entries]);
            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
        });

        test.each([
            [["Sex"]],
            [["Penner, Idiot, Sex"]]
        ])("adding entries", async (terms: string[]) => {
            expect(page).toHaveAllRows(entries);
            terms.forEach(t => addEntry(getAdder(page), t));

            timer.start("changes");
            page = await render.changes();
            timer.stop();

            let newEntries = terms.map(t => new BlacklistEntry(t))
            expect(page).toHaveAllMetadata(newEntries);
            clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);

            timer.start("blacklist");
            page = await render.blacklist();
            timer.stop();
            expect(page).toHaveAllRows(newEntries);
            expect(page).toHaveAllRows(entries);
            expect(serverMock.getBlacklist()).toEqual(entries.concat(newEntries));
        });
    })
});