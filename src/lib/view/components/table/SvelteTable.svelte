<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { onMount, setContext } from "svelte";
    import { fly } from "svelte/transition";
    import { crawlerKey } from "$lib/model/recursive_table/Types";

    import type { Table } from "$lib/model/recursive_table/TableComponents";
    import type { TableCrawler } from "$lib/model/recursive_table/TableCrawler";
    
    import TableComp from "./TableComp.svelte";
    import lodash from "lodash"
    import FilterElement from "./FilterElement.svelte";
    import type { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
import type { Listener } from "$lib/model/Listener";

    // Generic Types: 
    //      TA extends Table<T>
    //      C extends TableCrawler<T, C>
    type T = $$Generic;
    type TA = $$Generic<Table<T>>;
    type C = $$Generic<TableCrawler<T, C>>;

    // Table and styling related customizables, which are given to this component
    export let styling;

    // Some extra crawlers which are applied
    // Can add and alter behaviour
    export let extraCrawlers: Map<Symbol, any> = new Map();

    // A supplier and an updater to retreive table data
    export let supplier: () => TA;
    export let updater: (listener: Listener<TA>) => void;
    export let filterableData: () => [number, FilterStrategy<string>][];

    // Get the table data, but only work on a copy to preserve the original state
    let data: TA;
    let tableViewData: TA = lodash.cloneDeep(data);

    // Keys to the special filter and sorter crawlers
    const filterCrawlerKey = Symbol();
    const sorterCrawlerKey = Symbol();
    const crawlers: Map<Symbol, any> = new Map();

    // Insert filter and sorter crawler first, such that they are applied first
    crawlers.set(filterCrawlerKey, undefined);
    crawlers.set(sorterCrawlerKey, undefined)

    // Insert every given custom crawler
    extraCrawlers.forEach((crawler, key) => crawlers.set(key, crawler));

    // Add the listener to update the table data
    updater(newTable => {
        data = newTable;
        updateTableView();
    });

    /**
     * Update the displayed data.
     * Creates a new table and applies the crawlers to it.
     * Does not alter the given table.
     * @param table: {@link iTable} The original table
     */
    function updateTableView() {

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
    })
</script>

<style lang=scss>

</style>

<div class=svelte-table-wrapper in:fly>
    <FilterElement filters={filterableData()} />
    <TableComp bind:table={tableViewData} {styling}/>
</div>
