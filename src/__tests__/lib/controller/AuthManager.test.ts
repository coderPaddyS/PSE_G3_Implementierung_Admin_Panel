import AuthManager, { LoginConfiguration } from "$lib/controller/AuthManager";
import { jest } from "@jest/globals";
import type { Mock } from "jest-mock";

describe("Testing AuthManager.ts", () => {
    
    let auth: AuthManager;
    let onError: (error: string | Error) => void;
    const config: LoginConfiguration = {
        loginRedirectURI: new URL(`${window.location.origin}/admin/panel`),
        logoutRedirectURI: new URL(`${window.location.origin}/admin`),
        settings: {
            authority: "https://oidc.scc.kit.edu/auth/realms/kit/",
            client_id: "pse-itermori-de",
            redirect_uri: `${window.location.origin}/admin/login`,
            response_type: "code",
            scope: "openid profile email",
            automaticSilentRenew: true
        }
    };

    beforeEach(() => {
        onError = jest.fn();
        auth = new AuthManager(onError);
    });

    test("expect configureAuthentication to save data in session storage", () => {
        auth.configureAuthentication(config);
        expect(window.sessionStorage.getItem((AuthManager as any).configStoreKey).includes(config.settings.authority)).toBe(true);
    });

    test("expect redirectAfterLogin to call redirect on success", (done) => {
        
        // Hi-Jack the configureManager method to mock the siginCallback method
        auth.configureAuthentication(config);
        (auth as any).configureManager = config => {
            (auth as any).auth.signinCallback = () => {
                return Promise.resolve(undefined)
            };
        }

        let redirect = jest.fn().mockImplementation((href) => {
            expect(href).toEqual(config.loginRedirectURI.toString());
            done();
        });
        auth.redirectAfterLogin(redirect);
    });

    test("expect redirectAfterLogout to call redirect on success", (done) => {
        
        // Hi-Jack the configureManager method to mock the sigoutCallback method
        auth.configureAuthentication(config);
        (auth as any).configureManager = config => {
            (auth as any).auth.signoutRedirectCallback = () => {
                return Promise.resolve(undefined)
            };
        }

        let redirect = jest.fn().mockImplementation((href) => {
            expect(href).toEqual(config.logoutRedirectURI.toString());
            done();
        });
        auth.redirectAfterLogout(redirect);
    });

    test("getUserData", () => {
        (auth as any).userData = "test";
        expect(auth.getUserData()).toEqual("test");
    });

    test("getAccessToken", () => {
        (auth as any).getAccessToken = () => "test";
        expect(auth.getAccessToken()).toEqual("test");
    });

    test("onUserLoaded", () => {
        let user = {access_token: "test"};
        (auth as any).onUserLoaded(user);
        expect(auth.getAccessToken()).toEqual("test");
        expect(auth.isAuthenticated()).toBe(true);
    });

    test("onUserUnloaded", () => {
        let user = {access_token: "test"};
        (auth as any).onUserLoaded(user);
        (auth as any).onUserUnloaded();
        expect(auth.getAccessToken).toEqual(undefined);
        expect(auth.isAuthenticated()).toBe(false);
    });

    test("onSilentRenewError", () => {
        (auth as any).onSilentRenewError("test");
        expect(auth.isAuthenticated()).toBe(false);
        expect(onError).toBeCalled()
    });

    describe("logout", () => {
        let signout: Mock<Promise<void>, [void]>;

        beforeEach(() => {
            signout = jest.fn<Promise<void>, [void]>().mockImplementation(() => Promise.resolve());
            (auth as any).auth = jest.fn();
            (auth as any).auth.signoutRedirect = signout;
        });

        test("successful", () => {
            auth.logout();
            expect(signout).toBeCalled();
        });

        test("rejected", () => {
            signout.mockImplementationOnce(() => Promise.reject("test"));
            auth.logout();
            expect(signout).toBeCalled();
        });
    });

    describe("login", () => {
        let signin: Mock<Promise<void>, [void]>;

        beforeEach(() => {
            signin = jest.fn<Promise<void>, [void]>().mockImplementation(() => Promise.resolve());
            (auth as any).auth = jest.fn();
            (auth as any).auth.signinRedirect = signin;
        });

        test("successful", () => {
            auth.login();
            expect(signin).toBeCalled();
        });

        test("rejected", () => {
            signin.mockImplementationOnce(() => Promise.reject("test"));
            auth.login();
            expect(signin).toBeCalled();
        });
    });

    test("addAuthenticationListener", () => {
        let add = jest.fn();
        (auth as any).isLoggedIn.add = add;
        let listener = jest.fn()
        auth.addAuthenticationListener(listener);
        expect(add).toHaveBeenCalledWith(listener);
    });
});