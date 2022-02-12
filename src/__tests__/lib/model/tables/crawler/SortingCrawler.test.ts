/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableSortingCrawler } from "$lib/model/recursive_table/crawler/SortingCrawler";
import { Table, TableCell, TableData, TableRow } from "$lib/model/recursive_table/TableComponents";
import type { Sorter } from "$lib/model/recursive_table/Types";

describe("Testing TableSortingCrawler", () => {

    test("sorting a table of numbers", () => {
        const sorter: Sorter<TableRow<number>> = (a,b) => a <= b ? [a, b] : [b, a];
        let crawler = new TableSortingCrawler(sorter);
        let table = new Table<number>();

        for (let i = 0; i < 100; i++) {
            let random = Math.round(Math.random() * 100);
            table.add(new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(random))));
        }

        table.getCrawledOn(crawler);

        let sorted = true;
        let data = table.getData();
        for (let i = 0; i < 100; i++) {
            if (data[i] > data[i+1]) {
                sorted = false;
                break;
            }
        }
        expect(sorted).toBe(true);
    })
})