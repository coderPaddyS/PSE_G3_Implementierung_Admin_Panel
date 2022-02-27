import AuthManager from "$lib/controller/AuthManager";
import { Backend } from "$lib/controller/backend";
import type { DataObject, Predicate } from "$lib/model/recursive_table/Types";
import { jest } from "@jest/globals";

jest.mock('$lib/controller/AuthManager');

describe("Testing Backend.ts", () => {

    let backend: Backend;
    let onError: (error: string | Error) => void;
    let showEntry: Predicate<DataObject<string>>;

    function mockImplementation(impl: (body: string) => Promise<Object>) {
        (backend as any).fetchBackend = jest.fn().mockImplementation(impl);
    }

    beforeEach(() => {
        onError = jest.fn();
        showEntry = jest.fn<boolean, any>().mockImplementation(() => true);
        backend = new Backend(onError, showEntry);
        mockImplementation(jest.fn());
    })

    describe("by mocking fetch:", () => {

        test("isAdmin", () => {
            mockImplementation(body => {
                if (body.includes("isAdmin")) {
                    return Promise.resolve({data: {isAdmin: true}})
                }
            });
            expect(backend.isAdmin()).toEqual(Promise.resolve(true));
        })
    })
})