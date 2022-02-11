/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableRow } from "../TableComponents";
import { TableCrawler } from "../TableCrawler";
import type { Predicate } from "../Types";

/**
 * A {@link TableCrawler} to filter the table by a given {@link Predicate} per column
 * 
 * @template T The type of the data contained in the crawled {@link Table<T>}
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableColumnFilterCrawler<T> extends TableCrawler<T, TableColumnFilterCrawler<T>>{

    /**
     * The given {@link Predicate}s to filter the table by
     */
    private filters: Predicate<T[]>[];

    /**
     * Construct the TableFilterCrawler
     * @param filter {@link Predicate}
     */
    public constructor(filters: Predicate<T[]>[]) {
        super();
        this.filters = filters;
    }

    public override crawlRow(row: TableRow<T>, match?: () => void): TableRow<T> {
        let matches = 0;
        let validFilters = 0;
        row.getChilds().forEach((cell, index) => {
            if (index < this.filters.length) {
                switch (this.filters[index](cell.getData())) {
                    case true: matches++; validFilters++; break;
                    case false: validFilters++; break;
                }
            }
        });
        if (matches == validFilters) {
            match();
        }
        return row;
    }

    public crawlTable(table: Table<T>, match?: () => void): Table<T> {
        table.getChilds().forEach(row => {
            let matches: boolean = false;
            this.crawlRow(row, () => matches = true);
            if (!matches) {
                row.hide();
            } else {
                row.show();
            }
        });
        return table;
    }
}