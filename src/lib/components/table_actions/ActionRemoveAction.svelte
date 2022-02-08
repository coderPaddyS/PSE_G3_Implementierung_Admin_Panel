<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { Framework } from "$lib/controller/framework";
    import { TableActionCrawler } from "$lib/model/table/crawler/ActionCrawler";
    import type { TableComponent } from "$lib/model/table/TableComponents";
    import type { CrawlerAction } from "$lib/model/table/Types";

    // Data provided externally to provide the possiblity to add custom behaviour
    export let index: Array<number>;
    export let crawlOnView;

    // Generic type T
    type T = $$Generic;

    /**
     * The action used by a {@link TableActionCrawler} which gets executed on click.
     * This action collects the data of the current row and removes the action matching the data.
     * 
     * @param crawler the {@link TableActionCrawler} which executes the action.
     * @param component the row the crawler crawled on
     */
    const crawlerAction: CrawlerAction<T, TableActionCrawler<T>> = (crawler: TableActionCrawler<T>, component: TableComponent<T>) => {        
        let data = component.getData();

        Framework.getInstance().removeChange(data[0], data[1], data[2], data[3]);
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

<button on:click={() => crawlOnView(createCrawler())}>Entfernen</button>