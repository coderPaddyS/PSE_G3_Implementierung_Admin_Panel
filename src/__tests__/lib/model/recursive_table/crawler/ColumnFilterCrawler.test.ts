/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableColumnFilterCrawler } from "$lib/model/recursive_table/crawler/ColumnFilterCrawler"
import { Table, TableCell, TableComponent, TableData, TableDataTable, TableRow } from "$lib/model/recursive_table/TableComponents"
import type { Predicate } from "$lib/model/recursive_table/Types";
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter";
import { MaximumNumericFilter } from "$lib/model/tables/manager/filter/MaximumNumericFilter";
import { MinimumNumericFilter } from "$lib/model/tables/manager/filter/MinimumNumericFilter";

describe("Testing TableColumnFilterCrawler", () => {
    describe("to filter a valid table", () => {
        let table: Table<string>;
        let lexFilter = new LexicographicFilter<string>("test");
        let minNumFilter = new MinimumNumericFilter<string>("min_num_test");
        let maxNumFilter = new MaximumNumericFilter<string>("max_num_test");
        let minFilters: Predicate<string[]>[] = [
            (s) => lexFilter.filter(s),
            (n) => minNumFilter.filter(n)
        ];
        let maxFilters: Predicate<string[]>[] = [
            (s) => lexFilter.filter(s),
            (n) => maxNumFilter.filter(n)
        ];
        let crawler = new TableColumnFilterCrawler<string>(minFilters);
        let children: TableComponent<string>[];

        beforeEach(() => {
            table = new Table<string>().add(
                new TableRow<string>().add(
                    new TableCell<string>().add(new TableData<string>("a test")),
                    new TableCell<string>().add(new TableData<string>("42")),       
                ),
                new TableRow<string>().add(
                    new TableCell<string>().add(new TableData<string>("b test")),
                    new TableCell<string>().add(new TableData<string>("420")),       
                )
            );
            children = table.getChildren();
            lexFilter.setFilter(undefined);
            minNumFilter.setFilter(undefined);
            maxNumFilter.setFilter(undefined);
        })

        test.each([
            ["a", [0], [1]],
            ["b", [1], [0]],
            ["", [0, 1], []],
            ["ab", [], [0,1]],
            [undefined, [0,1], []],
            ["A", [0], [1]],
            ["B", [1], [0]],
            ["a t", [0], [1]],
            ["a T", [0], [1]],
        ])("lexicographically", (filter: string, shown: number[], hidden: number[]) => {
            lexFilter.setFilter(() => filter);
            table.getCrawledOn(crawler);
            shown.forEach(index => expect(children[index].isHidden()).toBe(false));
            hidden.forEach(index => expect(children[index].isHidden()).toBe(true));
        });  

        test.each([
            ["10", [0,1], []],
            ["-1", [0,1], []],
            ["41.9", [0,1], []],
            ["42", [0,1], []],
            ["42.1", [1], [0]],
            ["419", [1], [0]],
            ["420", [1], [0]],
            ["420.1", [], [0,1]],
            ["a", [], [0,1]],
            [undefined, [0,1], []]
        ])("numerically minimum", (filter: string, shown: number[], hidden: number[]) => {
            minNumFilter.setFilter(() => filter);
            table.getCrawledOn(crawler);
            shown.forEach(index => expect(children[index].isHidden()).toBe(false));
            hidden.forEach(index => expect(children[index].isHidden()).toBe(true));
        }); 
        
        test.each([
            ["10", [], [0,1]],
            ["-1", [], [0,1]],
            ["41.9", [], [0,1]],
            ["42", [0], [1]],
            ["42.1", [0], [1]],
            ["419", [0], [1]],
            ["420", [0,1], []],
            ["420.1", [0,1], []],
            ["a", [], [0,1]],
            [undefined, [0,1], []]
        ])("numerically maximum", (filter: string, shown: number[], hidden: number[]) => {
            let lexFilter = new LexicographicFilter<string>("test");
            let maxNumFilter = new MaximumNumericFilter<string>("max_num_test");
            maxNumFilter.setFilter(() => filter);
            table.getCrawledOn(new TableColumnFilterCrawler<string>([(s) => lexFilter.filter(s), (n) => maxNumFilter.filter(n)]));
            shown.forEach(index => expect(children[index].isHidden()).toBe(false));
            hidden.forEach(index => expect(children[index].isHidden()).toBe(true));
        });
    });
});