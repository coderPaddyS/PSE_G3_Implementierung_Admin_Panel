import Action from "$lib/components/table_actions/Action.svelte"
import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte"
import { jest } from "@jest/globals";

describe("Test Action.svelte", () => {
    describe("to render given text", () => {
        
        afterEach(() => cleanup());
        
        test("Test correctly", () => {
            const { container } = render(Action, {
                props: {text: "Test"}
            });
            let button = container.getElementsByTagName("button")[0];

            expect(container).toContainHTML("Test");
        });

        test("undefined correctly", () => {
            const { container } = render(Action, {
                props: {text: undefined}
            });
            let button = container.getElementsByTagName("button")[0];

            expect(button).not.toHaveTextContent("<button>undefined</button>");
        });

        test("empty string correctly", async () => {
            const { container } = render(Action, {
                props: {text: undefined}
            });
            let button = container.getElementsByTagName("button")[0];

            expect(button).toHaveTextContent("");
        });
    });

    describe("to handle given onclicks", () => {

        afterEach(() => cleanup());

        test("being undefined correctly", () => {
            let { container } = render(Action, {
                props: {
                    onClick: undefined
                }
            });

            let button = container.getElementsByTagName("button")[0];

            expect(() => fireEvent.click(button)).not.toThrow();
        });

        test("being empty correctly", () => {
            const { container } = render(Action, {
                props: {
                    onClick: []
                }
            });

            let button = container.getElementsByTagName("button")[0];

            expect(() => fireEvent.click(button)).not.toThrow();
        });

        test("containing a function correctly", () => {
            let mockOnClick: () => void = jest.fn()
            const { container } = render(Action, {
                props: {
                    onClick: [mockOnClick]
                }
            });

            let button = container.getElementsByTagName("button")[0];
            fireEvent.click(button);

            expect(mockOnClick).toBeCalledTimes(1);
        });

        test("containing multiple functions correctly", () => {
            let mockOnClick: () => void = jest.fn()
            const { container } = render(Action, {
                props: {
                    onClick: [mockOnClick, mockOnClick, mockOnClick]
                }
            });

            let button = container.getElementsByTagName("button")[0];
            fireEvent.click(button);

            expect(mockOnClick).toBeCalledTimes(3);
        });
    })
})