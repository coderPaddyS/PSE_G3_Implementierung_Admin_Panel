<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { setContext } from "svelte";
    import { crawlerKey } from "$lib/model/table/Types";

    import TableComp from "./TableComp.svelte";
    import type { TableCrawler } from "$lib/model/table/TableCrawler";
    import type { Table } from "$lib/model/table/TableComponents";
    import { cloneDeep } from "lodash"
    import { TableFilterCrawler } from "$lib/model/table/crawler/FilterCrawler";
    import { TableSortingCrawler } from "$lib/model/table/crawler/SortingCrawler";


    // Generic Types: 
    //      R extends iTableRow
    //      C extends TableCrawler<C>
    type T = $$Generic;
    type TA = $$Generic<Table<T>>;
    type C = $$Generic<TableCrawler<T, C>>;

    // Table and styling related customizables, which are given to this component
    export let size;

    // Some extra crawlers which are applied
    // Can add and alter behaviour
    export let extraCrawlers: Map<Symbol, any> = new Map();
    export let supplier: () => TA;
    export let updater: (listener: (table: TA) => void) => void;

    let data = supplier();
    updater(updateTableView)

    // Keys to the special filter and sorter crawlers
    const filterCrawlerKey = Symbol();
    const sorterCrawlerKey = Symbol();
    const crawlers: Map<Symbol, any> = new Map();

    // Insert filter and sorter crawler first, such that they are applied first
    crawlers.set(filterCrawlerKey, new TableFilterCrawler<T>((t) => true));
    crawlers.set(sorterCrawlerKey, new TableSortingCrawler<T>((a,b) => [a,b]))

    // Insert every given custom crawler
    extraCrawlers.forEach(crawlers.set);

    // The data which is displayed to the user
    // Always use a copy to return to the original state
    let tableViewData: TA = cloneDeep(data);

    /**
     * Update the displayed data.
     * Creates a new table and applies the crawlers to it.
     * Does not alter the given table.
     * @param table: {@link iTable} The original table
     */
    function updateTableView(table: TA) {
        tableViewData = cloneDeep(table);
        crawlers.forEach(crawler => {
            crawler.crawl(crawler, tableViewData);
        })
    }

    // Set the context such that child components can alter the filter and sorting behaviour
    setContext(crawlerKey, {
        filter: (crawler: TableCrawler<T,C>) => {
            crawlers.set(filterCrawlerKey, crawler);
            updateTableView(data);
        },
        sorter: (crawler: TableCrawler<T,C>) => {
            crawlers.set(sorterCrawlerKey, crawler);
            updateTableView(data);
        },
        crawlOnView: (crawler: C) => {
            crawler.crawl(crawler, tableViewData);
            // updateTableView(tableV)
        }
    })
</script>

<style lang=scss>

</style>

<TableComp data={[tableViewData]} {size}/>