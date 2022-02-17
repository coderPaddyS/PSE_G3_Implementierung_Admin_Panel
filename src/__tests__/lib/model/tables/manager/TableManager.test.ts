import { Table, TableCell, TableData, TableRow, TitleCell, TitleRow } from "$lib/model/recursive_table/TableComponents";
import type { DataObject } from "$lib/model/recursive_table/Types";
import type { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter";
import { TableManager } from "$lib/model/tables/manager/TableManager";
import type { ToDisplayData } from "$lib/model/tables/manager/ToDisplayData";
import { jest } from "@jest/globals";

const DATA = "data";

class DummyData implements ToDisplayData {

    private data: string[];

    public constructor(...data: string[]) {
        this.data = data && data.length != 0? data : [DATA];
    }

    public toDisplayData(): (string | DataObject<string>)[] {
        return this.data;
    }
}

class DummyTable extends TableManager<DummyData, DummyData> {
    protected async fetchData(): Promise<DummyData[]> {
        return [new DummyData()];
    }

    public filterableData(): [number, FilterStrategy<string>][] {
        return [[0, new LexicographicFilter(DATA)]];
    }

    protected async size(): Promise<number> {
        return undefined;
    }
}

describe("Testing TableManager", () => {
    
    const NAME = "manager";
    const TITLE = "TITLE";
    const TDATA = [new DummyData()];
    let manager: TableManager<DummyData, DummyData>;

    beforeEach(() => {
        manager = new DummyTable(NAME, new DummyData(), TDATA);
    });

    describe("to execute", () => {

        beforeEach(() => {
            manager = new DummyTable(NAME, new DummyData(), TDATA);
        });

        describe("contains correctly:", () => {
            test("contained", () => {
                expect(manager.contains(TDATA[0])).toBe(true);
                expect(manager.contains(new DummyData())).toBe(true);
            });
            test("not contained", () => {
                expect(manager.contains(new DummyData("43"))).toBe(false);
            });
            test("undefined", () => {
                expect(manager.contains(undefined)).toBe(false);
            });
        });

        describe("getTable correctly:", () => {
            test("undefined data", () => {
                let manager = new DummyTable(NAME, new DummyData("Title"));
                let table = new Table<string>().setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
            test("defined data", () => {
                let manager = new DummyTable(NAME, new DummyData("Title"), [new DummyData(), new DummyData()]);
                let table = new Table<string>()
                    .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                    .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))))
                    .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))))
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
            test("to fail on not matching title/data", () => {
                expect(() => new DummyTable(NAME, new DummyData("Title"), [new DummyData("a", "b")]))
                    .toThrowError("title")
            });
        });

        describe("hide correctly", () => {
            test("hide", () => {
                let manager = new DummyTable(NAME, new DummyData("Title"), [new DummyData()]);
                manager.hide(new DummyData());
                let row = new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA)));
                row.hide();
                let table = new Table<string>()
                    .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                    .add(row)
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
            test("hide and show", () => {
                let manager = new DummyTable(NAME, new DummyData("Title"), [new DummyData()]);
                manager.hide(new DummyData());
                manager.show(new DummyData());
                let table = new Table<string>()
                    .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                    .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))))
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
        });

        describe("setData correctly", () => {
            test("set undefined", () => {
                (manager as any).setData([new DummyData()]);
                let table = new Table<string>().setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
            test("set correct", () => {
                (manager as any).setData(undefined);
                let table = new Table<string>()
                    .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                    .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))))
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
        });

        describe("addData correctly", () => {

            beforeEach(() => manager = new DummyTable(NAME, new DummyData("Title"), [new DummyData()]));
            test("add undefined", () => {
                expect(() => (manager as any).addData(undefined)).toThrowError("title");
            });
            test("add correct", () => {
                (manager as any).addData(new DummyData());
                let table = new Table<string>()
                .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                    .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))))
                    .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))))
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
        });

        describe("removeData correctly", () => {
            let data: DummyData;
            beforeEach(() => {
                data = new DummyData();
                manager = new DummyTable(NAME, new DummyData("Title"), [data])
            });
            test("remove undefined", () => {
                (manager as any).removeData(undefined);
                let table = new Table<string>()
                    .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                    .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))));
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
            test("remove correct", () => {
                (manager as any).removeData(data);
                let table = new Table<string>()
                .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))));
                expect(manager.getTable()).toEqual(Promise.resolve(table));
            });
        });

        describe("getTableDisplayInformation correctly", () => {
            let manager = new DummyTable(NAME, new DummyData("Title"), [new DummyData(), new DummyData()]);
            let table = new Table<string>()
                .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData<string>("Title"))))
                .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))))
                .add(new TableRow<string>().add(new TableCell<string>().add(new TableData<string>(DATA))))
            let displayData = manager.getTableDisplayInformation();
            
            test("supplies table", () => {
                expect(displayData.supplier()).toEqual(Promise.resolve(table));
            });
            test("supplies name", () => {
                expect(displayData.tableTitle()).toEqual(NAME);
            });
            test("supplies size", () => {
                expect(displayData.size()).toEqual(Promise.resolve(table.getChildren().length));
            });
            test("supplies filterable data", () => {
                expect(displayData.filterableData()).toEqual([[0, new LexicographicFilter(DATA)]]);
            })
        })
    });
})