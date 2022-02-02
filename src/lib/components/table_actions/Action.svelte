<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { TableActionCrawler } from "$lib/model/table/crawler/ActionCrawler";
    import type { Table, TableComponent } from "$lib/model/table/TableComponents";
    import type { CrawlerAction } from "$lib/model/table/Types";

    // Generic Type T
    type T = $$Generic;

    // Data provided externally to provide the possiblity to add custom behaviour
    export let index: Array<number>;
    export let crawlOnView;

    // The text to be shown on the button
    export let text: string;

    // Listeners to be executed 
    export let onClick: Array<((data: T[], metadata: Object) => void)> = [];

    /**
     * The action to be performed by the crawler.
     * This action collects the data of the current row, matches the data to the title and
     * executes the onClick functions with the provided datas.
     * 
     * @param crawler the {@link TableActionCrawler} which executed this action
     * @param component the row the crawler crawled on.
     */
    const crawlerAction: CrawlerAction<T, TableActionCrawler<T>> = (crawler: TableActionCrawler<T>, component: TableComponent<T>) => {        
        let data = component.getData();
        let objectData: Object;
        crawlOnView(new TableActionCrawler<T>((crawler, comp) => {
            objectData = (comp as Table<T>).matchData(data);
        }))

        onClick.forEach((callback) => callback(data, objectData));
    }

    /**
     * Create a {@link TableActionCrawler} to crawl onto the row of the given index.
     */
    function createCrawler(): TableActionCrawler<T> {
        return new TableActionCrawler<T>(crawlerAction, index.slice(0, -2));
    }

</script>

<style lang="scss">

</style>

<button on:click={() => crawlOnView(createCrawler())}>{text}</button>