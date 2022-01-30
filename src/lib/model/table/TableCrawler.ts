/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableCell, TableComponent, TableData, TableRow, TitleCell, TitleRow } from "$lib/model/table/TableComponents";
import { eTableData } from "./TableComponents";

/**
 * A generic TableCrawler to crawl a table.
 * Enables to add custom behavior, as it crawls along the table and visits each element if desired.
 * 
 * @param E A type that extends this class to contain type safety and enable access to attributes.
 * 
 * @author Patrick Schneider
 * @version 1.0 
 */
export abstract class TableCrawler<T, E extends TableCrawler<T, E>> {
    
    /**
     * Crawl on a given table element
     * @param crawler The used crawler to refer to
     * @param table {@code iTable<iTableRow} The table to crawl on
     * @returns The crawled-on table with perhaps changed data
     */
    public crawlTable(crawler: E, table: Table<T>) {
        return;
    }

    /**
     * Crawl on a given row element
     * @param crawler The used crawler to refer to
     * @param row {@code iTableRow} The row to crawl on
     * @returns The crawled-on row with perhaps changed data
     */
    public crawlRow(crawler: E, row: TableRow<T>) {
        return;
    }

    /**
     * Crawl on a given cell element
     * @param crawler The used crawler to refer to
     * @param cell {@code iTableCell} The cell to crawl on
     * @returns The crawled-on cell with perhaps changed data
     */
    public crawlCell(crawler: E, cell: TableCell<T>) {
        return;
    }

    /**
     * Crawl on a given data element
     * @param crawler The used crawler to refer to
     * @param data {@code iTableData} The data to crawl on
     * @returns The crawled-on data with perhaps changed data
     */
    public crawlData(crawler: E, data: TableData<T>) {
        return;
    }

    /**
     * Crawl on a given title row element
     * @param crawler The used crawler to refer to
     * @param row {@code iTableRow} The title row to crawl on
     * @returns The crawled-on title row with perhaps changed data
     */
    public crawlTitleRow(crawler: E, titleRow: TitleRow<T>) {
        return;
    }

    /**
     * Crawl on a given title cell element
     * @param crawler The used crawler to refer to
     * @param titlecell {@code iTableCell} The title cell to crawl on
     * @returns The crawled-on title cell with perhaps changed data
     */
    public crawlTitleCell(crawler: E, titleCell: TitleCell<T>) {
        return;
    }

    /**
     * Crawl on a given iTableComponent.
     * @param crawler The crawler referred to
     * @param component {@code iTableComponent} The component to crawl on
     * @returns The crawled-on component with perhaps changed data
     */
    public crawl(crawler: E, component: TableComponent<T>) {
        switch (component.comp) {
            case eTableData.Table:      this.crawlTable(crawler, component as Table<T>); break;
            case eTableData.Row:        this.crawlRow(crawler, component as TableRow<T>); break;
            case eTableData.Cell:       this.crawlCell(crawler, component as TableCell<T>); break;
            case eTableData.Data:       this.crawlData(crawler, component as TableData<T>); break;
            case eTableData.TitleRow:   this.crawlTitleRow(crawler, component as TitleRow<T>); break;
            case eTableData.TitleCell:  this.crawlTitleCell(crawler, component as TitleCell<T>); break;
        }
    }
}