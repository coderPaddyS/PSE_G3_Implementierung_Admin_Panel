import { Settings } from "$lib/model/settings/Settings";
import { jest } from "@jest/globals"

class OpenSettings extends Settings {
    public constructor() {
        super();
    }
}

describe("Testing Settings.ts", () => {
    let settings: OpenSettings;

    function init() {
        window.localStorage.clear();
        settings = new OpenSettings();
    }

    beforeEach(() => init());

    test("restoring settings in constructor", () => {
        settings.update(data => {
            data.suggestionsMinNegative = -1;
            return data;
        });
        expect(settings.getData().suggestionsMinNegative).toBe(-1);
        settings = new OpenSettings();
        expect(settings.getData().suggestionsMinNegative).toBe(-1);
    });
});