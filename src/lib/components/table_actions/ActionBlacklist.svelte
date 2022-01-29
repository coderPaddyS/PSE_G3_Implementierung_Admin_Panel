<script lang=ts>
import { Framework } from "$lib/controller/framework";

import { dataset_dev } from "svelte/internal";

import { TableActionCrawler } from "../../model/table/crawler/ActionCrawler";
import type { CrawlerAction } from "../../model/table/Types";
import type { TableCrawler } from "../../model/table/TableCrawler";
import type { TableComponent } from "../../model/table/TableComponents";



    type T = $$Generic;
    type C = $$Generic<TableCrawler<T, C>>;

    export let index: Array<number>;
    export let crawlOnView;

    const crawlerAction: CrawlerAction<T, TableActionCrawler<T>> = (crawler: TableActionCrawler<T>, component: TableComponent<T>) => {
        let data = component.getData();

        Framework.getInstance().removeFromBlacklist(data[0] as unknown as string);
    }

    let crawler: TableActionCrawler<T> = new TableActionCrawler<T>(
        crawlerAction,
        index.slice(0, -2)
    );
</script>

<style lang="scss">

</style>

<button on:click={() => crawlOnView(crawler)}>Blacklisten</button>