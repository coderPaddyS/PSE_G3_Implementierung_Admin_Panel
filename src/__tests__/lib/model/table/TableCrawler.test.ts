import { Table, TableCell, TableData, TableRow, TitleCell, TitleRow } from "$lib/model/table/TableComponents";
import { TableCrawler } from "$lib/model/table/TableCrawler";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {}

describe("Testing abstract TableCrawler ", () => {
    let crawler: DummyCrawler<string>;
    const DATA = "data";

    beforeEach(() => {
        crawler = new DummyCrawler();
    });

    test("if crawled table does not change", () => {
        let table = new Table<string>();
        expect(crawler.crawlTable(table)).toEqual(table);
    });

    test("if crawled table row does not change", () => {
        let row = new TableRow<string>();
        expect(crawler.crawlRow(row)).toEqual(row);
    });

    test("if crawled table cell does not change", () => {
        let cell = new TableCell<string>();
        expect(crawler.crawlCell(cell)).toEqual(cell);
    });

    test("if crawled table data does not change", () => {
        let data = new TableData<string>(DATA);
        expect(crawler.crawlData(data)).toEqual(data);
    });

    test("if crawled title row does not change", () => {
        let row = new TitleRow<string>();
        expect(crawler.crawlTitleRow(row)).toEqual(row);
    });

    test("if crawled title cell does not change", () => {
        let cell = new TitleCell<string>();
        expect(crawler.crawlTitleCell(cell)).toEqual(cell);
    });
})