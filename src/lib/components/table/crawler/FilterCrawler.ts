/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { iTable, iTableCell, iTableData, iTableRow } from "../Types";
import { eTableData } from "../Types";
import { TableCrawler } from "../TableCrawler";
import type { Predicate } from "../Store";

/**
 * A {@link TableCrawler} to filter the whole table by a given {@link Predicate}
 * 
 * @param R The {@link iTableRow} used in this table
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableFilterCrawler<R extends iTableRow> extends TableCrawler<TableFilterCrawler<R>>{

    /**
     * The given {@link Predicate} to filter the table by
     */
    private filter: Predicate<iTableData>;

    /**
     * Construct the TableFilterCrawler
     * @param filter {@link Predicate}
     */
    public constructor(filter: Predicate<iTableData>) {
        super();
        this.filter = filter;
    }

    public crawlData<T extends iTableData>(crawler: TableFilterCrawler<R>, data: T): T {
        if (crawler.filter(data)) {
            return data;
        }
        return undefined;
    }

    public crawlCell<T extends iTableCell>(crawler: TableFilterCrawler<R>, cell: T): T {
        let filtered = cell.data.map((child) => {
            if (child.comp == eTableData.Table) {
                return crawler.crawlTable(crawler, child);
            }
            return crawler.crawlData(crawler, child);
        });
        if (filtered.find(e => e !== undefined)) {
            return cell;
        }
        return undefined;
    }

    public crawlRow<T extends iTableRow>(crawler: TableFilterCrawler<R>, row: T): T {
        let filtered = row.data
            .map(cell => crawler.crawlCell(crawler, cell))
            .filter(e => e !== undefined);
        if (filtered.length > 0) {
            return row;
        }
        return undefined
    }

    public crawlTable(crawler: TableFilterCrawler<R>, table: iTable<R>): iTable<R> {
        
        let filtered: R[] = [];
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