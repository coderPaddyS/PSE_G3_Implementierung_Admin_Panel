/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableCell, TableData, TableRow } from "../TableComponents";
import { eTableData } from "../TableComponents";
import { TableCrawler } from "../TableCrawler";
import type { Predicate } from "../Types";

/**
 * A {../TableCrawler whole table by a given {@link Predicate}
 * 
 * @param R The {@link iTableRow} used in this table
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableFilterCrawler<T> extends TableCrawler<T, TableFilterCrawler<T>>{

    /**
     * The given {@link Predicate} to filter the table by
     */
    private filter: Predicate<TableData<T>>;

    /**
     * Construct the TableFilterCrawler
     * @param filter {@link Predicate}
     */
    public constructor(filter: Predicate<TableData<T>>) {
        super();
        this.filter = filter;
    }

    public crawlData<TD extends TableData<T>>(crawler: TableFilterCrawler<T>, data: TD): TD {
        if (crawler.filter(data)) {
            return data;
        }
        return undefined;
    }

    public crawlCell<TC extends TableCell<T>>(crawler: TableFilterCrawler<T>, cell: TC): TC {
        let filtered = cell.data.map((child) => {
            if (child.comp == eTableData.Table) {
                return crawler.crawlTable(crawler, child as Table<T>);
            }
            return crawler.crawlData(crawler, child as TableData<T>);
        });
        if (filtered.find(e => e !== undefined)) {
            return cell;
        }
        return undefined;
    }

    public crawlRow<TR extends TableRow<T>>(crawler: TableFilterCrawler<T>, row: TR): TR {
        let filtered = row.data
            .map(cell => crawler.crawlCell(crawler, cell))
            .filter(e => e !== undefined);
        if (filtered.length > 0) {
            return row;
        }
        return undefined
    }

    public crawlTable<TA extends Table<T>>(crawler: TableFilterCrawler<T>, table: TA): TA {
        
        let filtered: TableRow<T>[] = [];
        table.data.forEach(row => {
            if (!row.filterable) {
                filtered.push(row);
            } else {
                let filteredRow = crawler.crawlRow(crawler, row);
                if (filteredRow !== undefined) {
                    filtered.push(filteredRow)
                }
            }
        })
        if (filtered.find(e => e !== undefined && e.filterable) !== undefined) {
            table.data = filtered;
            return table;
        }
        return undefined;
    }
}