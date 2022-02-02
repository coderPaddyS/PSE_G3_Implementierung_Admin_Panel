/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Table, TableCell, TableData, TableDataTable, TableRow } from "../TableComponents";
import { TableCrawler } from "../TableCrawler";
import type { Predicate } from "../Types";

/**
 * A {@link TableCrawler} to filter the whole table by a given {@link Predicate}
 * 
 * @template T The type of the data contained in the crawled {@link Table<T>}
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

    public override crawlData<TD extends TableData<T>>(data: TD): TD {
        if (data instanceof TableDataTable) {
            // Since there is no dynamic binding, instanceof is needed to differentiate.
            // A cast to unknown is therefore needed to tell the compiler that TD == TableDataTable
            return new TableDataTable<T>(this.crawlTable(data.getChilds()[0])) as unknown as TD;
        }
        if (this.filter(data)) {
            return data;
        }
        return undefined;
    }

    public override crawlCell<TC extends TableCell<T>>(cell: TC): TC {
        let filtered = cell.getChilds().map((child) => {
            return this.crawlData(child);
        });
        if (filtered.find(e => e !== undefined)) {
            return cell;
        }
        return undefined;
    }

    public override crawlRow<TR extends TableRow<T>>(row: TR): TR {
        let filtered = row.getChilds()
            .map(cell => this.crawlCell(cell))
            .filter(e => e !== undefined);
        if (filtered.length > 0) {
            return row;
        }
        return undefined;
    }

    public override crawlTable<TA extends Table<T>>(table: TA): TA {
        let filtered: TableRow<T>[] = [];
        table.getChilds().forEach(row => {
            let filteredRow = this.crawlRow(row);
            if (filtered !== undefined) {
                filtered.push(filteredRow);
            }
        });
        if (filtered.find(e => e !== undefined && e.isFilterable()) !== undefined) {
            table.setChilds(filtered);
            return table;
        }
        return undefined;
    }
}