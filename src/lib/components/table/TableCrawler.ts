/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { iTable, iTableCell, iTableComponent, iTableData, iTableRow } from "./Types";
import { eTableData } from "./Types";

/**
 * A generic TableCrawler to crawl a table.
 * Enables to add custom behavior, as it crawls along the table and visits each element if desired.
 * 
 * @param E A type that extends this class to contain type safety and enable access to attributes.
 * 
 * @author Patrick Schneider
 * @version 1.0 
 */
export abstract class TableCrawler<E extends TableCrawler<E>> {
    
    /**
     * Crawl on a given table element
     * @param crawler The used crawler to refer to
     * @param table {@code iTable<iTableRow} The table to crawl on
     * @returns The crawled-on table with perhaps changed data
     */
    public crawlTable(crawler: E, table: iTable<iTableRow>): iTable<iTableRow> {
        return table;
    }

    /**
     * Crawl on a given row element
     * @param crawler The used crawler to refer to
     * @param row {@code iTableRow} The row to crawl on
     * @returns The crawled-on row with perhaps changed data
     */
    public crawlRow(crawler: E, row: iTableRow): iTableRow {
        return row;
    }

    /**
     * Crawl on a given cell element
     * @param crawler The used crawler to refer to
     * @param cell {@code iTableCell} The cell to crawl on
     * @returns The crawled-on cell with perhaps changed data
     */
    public crawlCell(crawler: E, cell: iTableCell): iTableCell {
        return cell;
    }

    /**
     * Crawl on a given data element
     * @param crawler The used crawler to refer to
     * @param data {@code iTableData} The data to crawl on
     * @returns The crawled-on data with perhaps changed data
     */
    public crawlData(crawler: E, data: iTableData): iTableData {
        return data;
    }

    /**
     * Crawl on a given title row element
     * @param crawler The used crawler to refer to
     * @param row {@code iTableRow} The title row to crawl on
     * @returns The crawled-on title row with perhaps changed data
     */
    public crawlTitleRow(crawler: E, titleRow: iTableRow): iTableRow {
        return titleRow;
    }

    /**
     * Crawl on a given title cell element
     * @param crawler The used crawler to refer to
     * @param titlecell {@code iTableCell} The title cell to crawl on
     * @returns The crawled-on title cell with perhaps changed data
     */
    public crawlTitleCell(crawler: E, titleCell: iTableCell): iTableCell {
        return titleCell;
    }

    /**
     * Crawl on a given iTableComponent.
     * @param crawler The crawler referred to
     * @param component {@code iTableComponent} The component to crawl on
     * @returns The crawled-on component with perhaps changed data
     */
    protected crawl(crawler: E, component: iTableComponent): iTableComponent {
        switch (component.comp) {
            case eTableData.Table: return this.crawlTable(crawler, component as iTable<iTableRow>);
            case eTableData.Row: return this.crawlRow(crawler, component as iTableRow);
            case eTableData.Cell: return this.crawlCell(crawler, component as iTableCell);
            case eTableData.Data: return this.crawlData(crawler, component as iTableData);
            case eTableData.TitleRow: return this.crawlTitleRow(crawler, component as iTableRow);
            case eTableData.TitleCell: return this.crawlTitleRow(crawler, component as iTableCell);
        }
    }
}