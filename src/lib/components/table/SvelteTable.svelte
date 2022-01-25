<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { setContext } from "svelte";
    import { crawlerKey } from "./Store";

    import TableComp from "./TableComp.svelte";
    import type { TableCrawler } from "./TableCrawler";
    import type { iTable, iTableRow } from "./Types";
    import { cloneDeep } from "lodash"
    import { TableFilterCrawler } from "./crawler/FilterCrawler";
    import { TableSortingCrawler } from "./crawler/SortingCrawler";


    // Generic Types: 
    //      R extends iTableRow
    //      C extends TableCrawler<C>
    type R = $$Generic<iTableRow>;
    type C = $$Generic<TableCrawler<C>>

    // Table and styling related customizables, which are given to this component
    export let data: iTable<R>;
    export let size;

    // Some extra Crawlers which are applied
    // Can add and alter behaviour
    export let extraCrawlers: Map<Symbol, any> = new Map();

    // Keys to the special filter and sorter crawlers
    const filterCrawlerKey = Symbol();
    const sorterCrawlerKey = Symbol();
    const crawlers: Map<Symbol, any> = new Map();

    // Insert filter and sorter crawler first, such that they are applied first
    crawlers.set(filterCrawlerKey, new TableFilterCrawler<R>((t) => true));
    crawlers.set(sorterCrawlerKey, new TableSortingCrawler<R>((a,b) => [a,b]))

    // Insert every given custom crawler
    extraCrawlers.forEach(crawlers.set);

    // The data which is displayed to the user
    // Always use a copy to return to the original state
    let tableViewData: iTable<R> = cloneDeep(data);

    /**
     * Update the displayed data.
     * Creates a new table and applies the crawlers to it.
     * Does not alter the given table.
     * @param table: {@link iTable} The original table
     */
    function updateTableView(table: iTable<R>) {
        tableViewData = cloneDeep(table);
        crawlers.forEach(crawler => {
            tableViewData = crawler.crawl(crawler, tableViewData);
        })
    }

    // Set the context such that child components can alter the filter and sorting behaviour
    setContext(crawlerKey, {
        filter: (crawler: TableCrawler<C>) => {
            crawlers.set(filterCrawlerKey, crawler);
            updateTableView(data);
        },
        sorter: (crawler: TableCrawler<C>) => {
            crawlers.set(sorterCrawlerKey, crawler);
            updateTableView(data);
        }
    })
</script>

<style lang=scss>

</style>

<TableComp data={[tableViewData]} {size}/>