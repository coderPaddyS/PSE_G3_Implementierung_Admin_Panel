import { ErrorQueue } from "$lib/model/error/ErrorQueue";
import type { Listener } from "$lib/model/Listener";
import lodash from "lodash";
import { jest } from "@jest/globals";

describe("Testing ErrorQueue", () => {
    let listener: Listener<(Error | string)[]>;
    let errors: ErrorQueue;

    beforeEach(() => {
        listener = jest.fn();
        errors = new ErrorQueue();
        errors.addListener(listener);
    });

    test.each([
        [["error"], ["error"]],
        [[Error("test")], [Error("test")]],
    ])("addError", (given: (string | Error)[], expected: (string | Error)[]) => {
        let listener = jest.fn().mockImplementation((e: (string | Error)[]) => {
            e.forEach(error => {
                let contained = false;
                expected.forEach(err => {
                    if (lodash.isEqual()) {
                        contained = true;
                    }
                });
                expect(contained).toBe(true)
            });
        })
        errors.addListener(listener);
        given.forEach(error => errors.addError(error));
        expect(listener).toBeCalledTimes(given.length);
    });

    test.each([
        [["error"]],
        [[Error("test")]],
    ])("removeError", (given: (string | Error)[]) => {
        let listener = jest.fn()
        errors.addListener(listener);
        given.forEach(error => errors.addError(error));
        given.forEach(error => errors.removeError(error));
        expect(listener).toBeCalledTimes(given.length * 2);
    });
});