<script lang=ts>

import { TableActionCrawler } from "$lib/model/table/crawler/ActionCrawler";
import type { TableComponent } from "$lib/model/table/TableComponents";

import type { CrawlerAction } from "$lib/model/table/Types";

    export let index: Array<number>;
    export let crawlOnView;

    export let removeFromSource: (data: T[]) => void;

    type T = $$Generic;

    const crawlerAction: CrawlerAction<T, TableActionCrawler<T>> = (crawler: TableActionCrawler<T>, component: TableComponent<T>) => {        
        let data = component.getData();

        removeFromSource(data);
    }

    function createCrawler(): TableActionCrawler<T> {
        return new TableActionCrawler<T>(crawlerAction, index.slice(0, -2));
    }

</script>

<style lang="scss">

</style>

<button on:click={() => crawlOnView(createCrawler())}>Entfernen</button>