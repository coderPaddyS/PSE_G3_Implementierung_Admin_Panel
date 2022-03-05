import { Framework } from "$lib/controller/framework";
import type { DataObject } from "$lib/model/recursive_table/Types";
import type { BlacklistEntry } from "$lib/model/tables/blacklist/Blacklist";
import type { ChangeAction } from "$lib/model/tables/changes/ChangeAction";
import { Tables } from "$lib/model/tables/Tables";
import { jest } from "@jest/globals";

export class OpenFramework extends Framework {
    public constructor() {
        super();
    }
}

describe("Testing Framework.ts", () => {
    
    let framework: Framework;

    function init() {
        framework = new OpenFramework();
    }

    beforeEach(() => init());

    test("getInstance", () => {
        let fw = Framework.getInstance();
        expect(fw).toBe(Framework.getInstance());
    });

    describe("setActionComponentFactory", () => {
        let backendSetActionComponent;
        let changesSetActionComponent;

        beforeEach(() => {
            init();
            backendSetActionComponent = jest.fn();
            changesSetActionComponent = jest.fn();
            (framework as any).backend.setActionComponentFactory = backendSetActionComponent;
            (framework as any).changes.setActionComponentFactory = changesSetActionComponent;
        });
        test("blacklist", () => {
            framework.setActionComponentFactory(Tables.BLACKLIST, undefined);
            expect(backendSetActionComponent).toBeCalled();
        });
        test("suggestions", () => {
            framework.setActionComponentFactory(Tables.ALIAS_SUGGESTIONS, undefined);
            expect(backendSetActionComponent).toBeCalled();
        });
        test("official", () => {
            framework.setActionComponentFactory(Tables.ALIAS, undefined);
            expect(backendSetActionComponent).toBeCalled();
        });
        test("changes", () => {
            framework.setActionComponentFactory(Tables.CHANGES, undefined);
            expect(changesSetActionComponent).toBeCalled();
        });
    });

    describe("getTableDisplayInformation", () => {
        let backendTableDisplay;
        let changesTableDisplay;

        beforeEach(() => {
            init();
            backendTableDisplay = jest.fn();
            changesTableDisplay = jest.fn();
            (framework as any).backend.getTableDisplayInformation = backendTableDisplay;
            (framework as any).changes.getTableDisplayInformation = changesTableDisplay;
        });
        test("blacklist", () => {
            framework.getTableDisplayInformation(Tables.BLACKLIST);
            expect(backendTableDisplay).toBeCalled();
        });
        test("suggestions", () => {
            framework.getTableDisplayInformation(Tables.ALIAS_SUGGESTIONS);
            expect(backendTableDisplay).toBeCalled();
        });
        test("official", () => {
            framework.getTableDisplayInformation(Tables.ALIAS);
            expect(backendTableDisplay).toBeCalled();
        });
        test("changes", () => {
            framework.getTableDisplayInformation(Tables.CHANGES);
            expect(changesTableDisplay).toBeCalled();
        });
    });

    test("getTables", () => {
        expect(framework.getTables()).toEqual([Tables.ALIAS, Tables.ALIAS_SUGGESTIONS, Tables.BLACKLIST, Tables.CHANGES]);
    });

    test("addChange", () => {
        let add = jest.fn();
        (framework as any).changes.add = add;
        framework.addChange(undefined);
        expect(add).toBeCalled();
    });

    test("onChangesUpdate", () => {
        let add = jest.fn();
        (framework as any).changes.addListener = add;
        framework.onChangesUpdate(undefined);
        expect(add).toBeCalled();
    });

    test("containsChangeByMetadata", () => {
        let contains = jest.fn();
        (framework as any).changes.containsMetadata = contains;
        framework.containsChangeByMetadata(undefined);
        expect(contains).toBeCalled();
    });

    test("login", () => {
        let login = jest.fn();
        (framework as any).backend.login = login;
        framework.login();
        expect(login).toBeCalled();
    });

    test("logout", () => {
        let logout = jest.fn();
        (framework as any).backend.logout = logout;
        framework.logout();
        expect(logout).toBeCalled();
    });

    test("onAuthenticationUpdate", () => {
        let onUpdate = jest.fn();
        (framework as any).backend.addAuthenticationListener = onUpdate;
        framework.onAuthenticationUpdate(undefined);
        expect(onUpdate).toBeCalled();
    });

    test("isAuthenticated", () => {
        let isAuthenticated = jest.fn();
        (framework as any).backend.isAuthenticated = isAuthenticated;
        framework.isAuthenticated();
        expect(isAuthenticated).toBeCalled();
    });

    test("isAdmin", () => {
        let isAdmin = jest.fn();
        (framework as any).backend.isAdmin = isAdmin;
        framework.isAdmin();
        expect(isAdmin).toBeCalled();
    });

    test("redirectAfterLogin", () => {
        let redirect = jest.fn();
        (framework as any).backend.redirectAfterLogin = redirect;
        framework.redirectAfterLogin(undefined);
        expect(redirect).toBeCalled();
    });

    test("redirectAfterLogout", () => {
        let redirect = jest.fn();
        (framework as any).backend.redirectAfterLogout = redirect;
        framework.redirectAfterLogout(undefined);
        expect(redirect).toBeCalled();
    });

    test("addError", () => {
        let addError = jest.fn();
        (framework as any).errors.addError = addError;
        framework.addError(undefined);
        expect(addError).toBeCalled();
    });

    test("onError", () => {
        let onError = jest.fn();
        (framework as any).errors.addListener = onError;
        framework.onError(undefined);
        expect(onError).toBeCalled();
    });

    test("addError", () => {
        let removeError = jest.fn();
        (framework as any).errors.removeError = removeError;
        framework.removeError(undefined);
        expect(removeError).toBeCalled();
    });

    test("configureAuthentication", () => {
        let configureAuthentication = jest.fn();
        (framework as any).backend.configureAuthentication = configureAuthentication;
        framework.configureAuthentication(undefined);
        expect(configureAuthentication).toBeCalled();
    });

    test("addToBlacklist", () => {
        const entry = "test";
        let blacklistAdd = jest.fn().mockImplementation((e: BlacklistEntry) => expect(e.toDisplayData()[0]).toEqual(entry));
        let addChange = jest.fn().mockImplementation((action: ChangeAction) => {
            expect(action.getMetadata()["0"][1][0]).toEqual(entry);
            action.perform();
            expect(blacklistAdd).toBeCalled();
            expect(action.remove()).toEqual(Promise.resolve(true));
        });
        (framework as any).addChange = addChange;
        (framework as any).backend.addToBlacklist = blacklistAdd;
        framework.addToBlacklist(entry);
        expect(addChange).toBeCalled();
    });

    test("getUserData", () => {
        let get = jest.fn();
        (framework as any).backend.getUserData = get;
        framework.getUserData();
        expect(get).toBeCalled();
    });

    test("backend constructor methods", () => {
        let addError = jest.fn();
        let contains = jest.fn<boolean, [DataObject<string>]>();
        let change = jest.fn<void, [ChangeAction]>();
        (framework as any).errors.addError = addError;
        framework.containsChangeByMetadata = contains;
        framework.addChange = change;
        (framework as any).backend.notifyError();
        (framework as any).backend.blacklist.showEntry(undefined);
        (framework as any).backend.blacklist.addChange(undefined);
        expect(addError).toBeCalled();
        expect(contains).toBeCalled();
        expect(change).toBeCalled();
    })
});