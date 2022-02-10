<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { onMount, setContext } from "svelte";
    import { crawlerKey } from "$lib/model/table/Types";

    import type { Table } from "$lib/model/table/TableComponents";
    import type { TableCrawler } from "$lib/model/table/TableCrawler";
    import { TableFilterCrawler } from "$lib/model/table/crawler/FilterCrawler";
    import { TableSortingCrawler } from "$lib/model/table/crawler/SortingCrawler";
    
    import TableComp from "./TableComp.svelte";
    import lodash from "lodash"
import FilterElement from "./FilterElement.svelte";
import type { FilterStrategy } from "$lib/model/TableManager/filter/FilterStrategy";


    // Generic Types: 
    //      TA extends Table<T>
    //      C extends TableCrawler<T, C>
    type T = $$Generic;
    type TA = $$Generic<Table<T>>;
    type C = $$Generic<TableCrawler<T, C>>;

    // Table and styling related customizables, which are given to this component
    export let size;

    // Some extra crawlers which are applied
    // Can add and alter behaviour
    export let extraCrawlers: Map<Symbol, any> = new Map();

    // A supplier and an updater to retreive table data
    export let supplier: () => TA;
    export let updater: (listener: (table: TA) => void) => void;
    export let filterableData: () => [number, FilterStrategy<string>][];

    // Get the table data, but only work on a copy to preserve the original state
    let data: TA;
    let tableViewData: TA = lodash.cloneDeep(data);

    // Keys to the special filter and sorter crawlers
    const filterCrawlerKey = Symbol();
    const sorterCrawlerKey = Symbol();
    const crawlers: Map<Symbol, any> = new Map();

    // Insert filter and sorter crawler first, such that they are applied first
    crawlers.set(filterCrawlerKey, new TableFilterCrawler<T>((t) => true));
    crawlers.set(sorterCrawlerKey, new TableSortingCrawler<T>((a,b) => [a,b]))

    // Insert every given custom crawler
    extraCrawlers.forEach((crawler, key) => crawlers.set(key, crawler));

    // Add the listener to update the table data
    updater(newTable => {
        data = lodash.cloneDeep(newTable);
        console.log("fkhlhsfdljh", data);
        updateTableView();
    });

    /**
     * Update the displayed data.
     * Creates a new table and applies the crawlers to it.
     * Does not alter the given table.
     * @param table: {@link iTable} The original table
     */
    function updateTableView() {

        // A clone is sadly currently needed as otherwise the changes to the
        // data are not detected and reflected.
        tableViewData = lodash.cloneDeep(data);

        if (tableViewData) {
            crawlers.forEach(crawler => {
                if (crawler) {
                    tableViewData.getCrawledOn(crawler);
                }
            })
        }
    }

    // Set the context such that child components can alter the filter and sorting behaviour
    setContext(crawlerKey, {
        setFilter: (crawler: TableCrawler<T,C>) => {
            crawlers.set(filterCrawlerKey, crawler);
            updateTableView();
        },
        sorter: (crawler: TableCrawler<T,C>) => {
            crawlers.set(sorterCrawlerKey, crawler);
            updateTableView();
        },
        crawlOnView: (crawler: C) => {
            tableViewData.getCrawledOn(crawler);
        }
    })

    onMount(() => {
        data = supplier();
        tableViewData = lodash.cloneDeep(data);
        console.log("data", data);
    })
</script>

<style lang=scss>

</style>

<FilterElement filters={filterableData()}/>
<TableComp bind:table={tableViewData} {size}/>
