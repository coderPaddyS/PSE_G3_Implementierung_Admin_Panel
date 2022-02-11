import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte";
import { jest } from "@jest/globals";
import { TitleCell, TableData, TitleRow } from "$lib/model/recursive_table/TableComponents";
import TitleRowComp from "$lib/view/components/table/TitleRowComp.svelte";
import MockContext from "./__mocks__/MockContext.svelte";
import { crawlerKey } from "$lib/model/recursive_table/Types";

describe("Test TitleRowComp.svelte", () => {
    describe("to render given", () => {
        
        let row: TitleRow<string>;
        let crawlOnView = jest.fn();
        beforeEach(() => {
            row = new TitleRow<string>().add(new TitleCell<string>().set(new TableData("Data")));
        })
        afterEach(() => cleanup());
        
        test("test row correctly", () => {
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TitleRowComp,
                    props: {row, index: [], size: ""}
                }
            });

            expect(container).toHaveTextContent("Data");
        });

        test("hidden test row correctly", () => {
            row.hide();
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TitleRowComp,
                    props: {row, index: [], size: ""}
                }
            });

            expect(container).not.toHaveTextContent("Data");
        });

        test("row being undefined correctly", () => {
            const { container } = render(TitleRowComp, {
                props: {row: undefined, index: [], size: ""}
            });

            expect(container).not.toHaveTextContent("undefined");
        });

        test("row without children correctly", async () => {
            const { container } = render(TitleRowComp, {
                props: {row: new TitleRow(), index: [], size: ""}
            });

            let div = container.getElementsByClassName("titlerow")[0];

            expect(div).not.toBe(undefined);
        });
    });
});