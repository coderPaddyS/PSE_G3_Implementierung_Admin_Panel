import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte";
import { jest } from "@jest/globals";
import { Table, TableCell, TableData, TableDataComponent, TableDataHTML, TableDataTable, TableRow, TitleCell, TitleRow } from "$lib/model/table/TableComponents";
import TableDataComp from "$lib/components/table/TableDataComp.svelte";
import MockContext from "./__mocks__/MockContext.svelte";
import { crawlerKey } from "$lib/model/table/Types";
import Action from "$lib/components/table_actions/Action.svelte";

describe("Test TableDataComp.svelte", () => {
    describe("to handle given instance of", () => {
        
        let crawlOnView = jest.fn();
        afterEach(() => cleanup());

        describe("TableData", () => {
            test("correctly by rendering it", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data: new TableData<string>("Data"), index: [], size: ""}
                    }
                });
    
                expect(container).toHaveTextContent("Data");
            });

            test("correctly by not rendering undefined", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data: new TableData<string>(undefined), index: [], size: ""}
                    }
                });
    
                expect(container).not.toHaveTextContent("undefined");
            });

            test("correctly by rendering the html as text", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data: new TableData<string>(
                            "<div class=xss />"
                        ), index: [], size: ""}
                    }
                });

                let div = container.getElementsByClassName("xss")[0];
    
                expect(container).toHaveTextContent("<div class=xss />");
                expect(div).toBe(undefined);
            });

            test("correctly by not rendering if hidden", () => {
                let data = new TableData<string>("Data");
                data.hide();
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data, index: [], size: ""}
                    }
                });

                let div = container.getElementsByClassName("data")[0];

                expect(container).not.toHaveTextContent("Data");
                expect(div).toBe(undefined);
            });
        });

        describe("TableDataHTML", () => {
            test("correctly by rendering it", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data: new TableDataHTML<string>("Data"), index: [], size: ""}
                    }
                });
    
                expect(container).toHaveTextContent("Data");
            });

            test("correctly by not rendering undefined", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data: new TableDataHTML<string>(undefined), index: [], size: ""}
                    }
                });
    
                expect(container).not.toHaveTextContent("undefined");
            });

            test("correctly by rendering the html", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data: new TableDataHTML<string>(
                            "<div class=xss />"
                        ), index: [], size: ""}
                    }
                });

                let div = container.getElementsByClassName("xss")[0];
    
                expect(container).not.toHaveTextContent("<div class=xss />");
                expect(div).not.toBe(undefined);
            });

            test("correctly by not rendering if hidden", () => {
                let data = new TableDataHTML<string>("Data");
                data.hide();
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data, index: [], size: ""}
                    }
                });

                let div = container.getElementsByClassName("data")[0];

                expect(container).not.toHaveTextContent("Data");
                expect(div).toBe(undefined);
            });
        });

        describe("TableDataTable", () => {
            let table;

            beforeEach(() => {
                table = new Table<string>()
                    .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData("Title"))))
                    .add(new TableRow<string>().add(new TableCell<string>().add(new TableData("Data"))));
            })
            test("correctly by rendering it", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data: new TableDataTable<string>(table), index: [], size: ""}
                    }
                });
    
                expect(container).toHaveTextContent("Data");
                expect(container).toHaveTextContent("Title");
            });

            test("correctly by not rendering undefined", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data: new TableDataTable<string>(undefined), index: [], size: ""}
                    }
                });
    
                expect(container).not.toHaveTextContent("undefined");
            });

            test("correctly by not rendering if hidden", () => {
                let data = new TableDataTable<string>(table);
                data.hide();
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: crawlOnView,
                        component: TableDataComp,
                        props: {data, index: [], size: ""}
                    }
                });

                let div = container.getElementsByClassName("data")[0];

                expect(container).not.toHaveTextContent("Data");
                expect(div).toBe(undefined);
            });
        });

        describe("TableDataComponent", () => {
            let data;

            beforeEach(() => {
                data = new TableDataComponent<string>((root, props) => {
                    return new Action({
                        target: root,
                        props: {
                            onClick: [],
                            text: "Data",
                            ...props
                        }
                    })
                })
            });

            test("correctly by rendering it", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: {crawlOnView},
                        component: TableDataComp,
                        props: {data, index: [], size: ""}
                    }
                });
                let button = container.getElementsByTagName("button")[0];
                expect(container).toHaveTextContent("Data");
                expect(button).not.toBe(undefined);
            });

            test("correctly by not rendering undefined", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: {crawlOnView},
                        component: TableDataComp,
                        props: {data: new TableDataComponent<string>(undefined), index: [], size: ""}
                    }
                });

                let button = container.getElementsByTagName("button")[0];
                expect(button).toBe(undefined);
                expect(container).not.toHaveTextContent("undefined");
            });

            test("correctly by not rendering if hidden", () => {
                data.hide();
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: {crawlOnView},
                        component: TableDataComp,
                        props: {data, index: [], size: ""}
                    }
                });

                let button = container.getElementsByTagName("button")[0];
                expect(button).toBe(undefined);
                expect(container).not.toHaveTextContent("Data");
            });
        });
    });
});