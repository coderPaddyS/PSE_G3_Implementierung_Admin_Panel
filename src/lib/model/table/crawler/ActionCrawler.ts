/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import type { Table, TableCell, TableComponent, TableData, TableRow } from "../TableComponents";
import { TableCrawler } from "../TableCrawler";
import type { CrawlerAction } from "../Types";

/**
 * A {@link TableCrawler} to perform an action onto a table component specified by the index.
 * 
 * @template T The type used in this table
 * 
 * @author Patrick Schneider
 * @version 1.0
 */
export class TableActionCrawler<T> extends TableCrawler<T,TableActionCrawler<T>>{

    /**
     * The {@link CrawlerAction} to be performed
     */
    private action: CrawlerAction<T, TableActionCrawler<T>>;

    private index: Array<number>;
    private crawlChildren: boolean;

    /**
     * Construct a new instance.
     * @param action {@link CrawlerAction}
     * @param index An Array specifying the index of the component which should be crawled on.
     */
    public constructor(action: CrawlerAction<T, TableActionCrawler<T>>, index?: Array<number>, crawlChildren?: boolean) {
        super();
        if (action === undefined) {
            throw new Error("a TableActionCrawler needs to have an action, otherwise it is useless");
        }
        this.action = action;
        this.index = index === undefined ? undefined : index.reverse();
        this.crawlChildren = crawlChildren === undefined ? true : crawlChildren;
    }

    public override crawlTable(table: Table<T>): Table<T> {
        return this.crawl(table);
    }

    public override crawlRow(row: TableRow<T>): TableRow<T> {
        return this.crawl(row);
    }

    public override crawlCell(cell: TableCell<T>): TableCell<T> {
        return this.crawl(cell);
    }

    public override crawlData(data: TableData<T>): TableData<T> {
        return this.crawl(data);
    }

    private crawl<C extends TableComponent<T>>(component: C): C {
        if (component === undefined) {
            return undefined;
        } else if (this.index !== undefined && this.index.length > 0) {
            let index = this.index.pop();
            let children = component.getChilds();
            if (Array.isArray(children)) {
                if (children.length < index || index < 0) {
                    throw new Error(`index ${index} is out of bounce. Maximum: ${children.length}, Minimum: 0`);
                }
                children[index].getCrawledOn(this);
            } else {
                throw new Error(`${typeof component} does not have any child components.`);
            }
        } else {
            this.action(this, component);
            if (this.crawlChildren) {
                let children = component.getChilds();
                if (Array.isArray(children)) {
                    children.forEach(child => child.getCrawledOn(this));
                }
            }
        }
        return component;
    }
}