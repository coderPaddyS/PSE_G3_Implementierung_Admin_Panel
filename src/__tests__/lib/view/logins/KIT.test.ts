import { render } from "@testing-library/svelte";
import Login from "$lib/view/logins/KIT/index.svelte";
import type { LoginConfiguration } from "$lib/controller/AuthManager";
import { fireEvent } from "@testing-library/dom";
import { jest } from "@jest/globals";

describe("Test KIT.svelte", () => {
    test("to behave correctly", () => {
        let login = jest.fn();
        const { container } = render(Login, {
        props: {
                configure: (config: LoginConfiguration) => {
                    expect(config.settings.authority).not.toBeNull();
                    expect(config.settings.authority.includes("kit")).toBe(true);
                },
                login
            }
        });

        expect(container).toHaveTextContent("KIT");
        let button = container.getElementsByTagName("button")[0];
        fireEvent.click(button);
        expect(login).toBeCalled();
    });
});