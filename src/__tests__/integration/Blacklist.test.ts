
import { Framework } from "$lib/controller/framework";
import { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import { jest } from "@jest/globals";
import { fireEvent } from "@testing-library/dom";
import { ServerMock } from "./__setup__/serverMock";
import { BUTTON } from "./__setup__/constants";
import { clickOnButtonForRows, clickOnButtonForSomeRows, getAllRows } from "./__setup__/helpers";
import { matchers } from "./__setup__/matcher";
import render from "./__setup__/pageRenderer";
import { OpenFramework } from "./__setup__/__mocks__/OpenFramework";

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
            page = await render.blacklist();
        });

        test("renders correctly", async () => {
            expect(page).toHaveAllRows([entry]);
            expect(getAllRows(page).length).toBe(serverMock.getBlacklist().length);
        });

        test("can be removed", async () => {
            expect(page).toHaveAllRows([entry]);
            clickOnButtonForRows(page, BUTTON.BLACKLIST.DELETE);

            page = await render.blacklist();
            expect(page).not.toHaveAllRows([entry]);
            
            page = await render.changes();
            expect(getAllRows(page).length).toBe(1);
            expect(page).toHaveAllMetadata([entry]);

            clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);
            
            page = await render.changes();
            expect(getAllRows(page).length).toBe(0);
            expect(serverMock.getBlacklist().length).toBe(0);

            page = await render.blacklist();
            expect(page).not.toHaveAllRows([entry]);
        });

        test("is visible after abortion of change", async () => {
            expect(page).toHaveAllRows([entry]);
            clickOnButtonForRows(page, BUTTON.BLACKLIST.DELETE);

            page = await render.blacklist();
            expect(page).not.toHaveAllRows([entry]);

            page = await render.changes();
            expect(getAllRows(page).length).toBe(1);
            expect(page).toHaveAllMetadata([entry]);

            clickOnButtonForRows(page, BUTTON.CHANGES.CANCEL);
            
            page = await render.changes();
            expect(getAllRows(page).length).toBe(0);

            page = await render.blacklist();
            expect(page).toHaveAllRows([entry]);
            expect(serverMock.getBlacklist().length).toBe(1);
        });
    });

    describe("multiple entries", () => {

        beforeEach(async () => {
            serverMock.setBlacklist([new BlacklistEntry("seggs"), new BlacklistEntry("penis"), new BlacklistEntry("arsch")]);
            page = await render.blacklist();
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

            page = await render.blacklist();
            expect(page).toHaveSomeRows(alwaysVisible, serverMock.getBlacklist());
            expect(page).not.toHaveSomeRows(toRemove, serverMock.getBlacklist());

            page = await render.changes();
            expect(page).toHaveSomeMetadata(toRemove, serverMock.getBlacklist());
            expect(getAllRows(page).length).toBe(toRemove.length);

            clickOnButtonForRows(page, BUTTON.CHANGES.ACCEPT);

            page = await render.changes();
            expect(page).not.toHaveSomeMetadata(toRemove, serverMock.getBlacklist());
            expect(getAllRows(page).length).toBe(0);
            expect(serverMock.getBlacklist().length).toBe(alwaysVisible.length);

            page = await render.blacklist();
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

            page = await render.blacklist();
            expect(page).toHaveSomeRows(alwaysVisible, serverMock.getBlacklist());
            expect(page).not.toHaveSomeRows(toRemove, serverMock.getBlacklist());

            page = await render.changes();
            expect(page).toHaveSomeMetadata(toRemove, serverMock.getBlacklist());
            expect(getAllRows(page).length).toBe(toRemove.length);

            clickOnButtonForRows(page, BUTTON.CHANGES.CANCEL);
            
            page = await render.changes();
            expect(getAllRows(page).length).toBe(0);
            expect(page).not.toHaveSomeMetadata(toRemove, serverMock.getBlacklist());
            expect(serverMock.getBlacklist().length).toBe(toRemove.length + alwaysVisible.length);

            page = await render.blacklist();
            expect(getAllRows(page).length).toBe(serverMock.getBlacklist().length);
            expect(page).toHaveAllRows(serverMock.getBlacklist())
        });
    });
});