<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { TableColumnFilterCrawler } from "$lib/model/recursive_table/crawler/ColumnFilterCrawler";
    import { crawlerKey, Predicate } from "$lib/model/recursive_table/Types";
import type { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
    import { getContext } from "svelte";

    const { filter, setFilter } = getContext(crawlerKey);

    type T = $$Generic;
    export let filters: [number, FilterStrategy<string>][];
    let values: string[] = [...Array.from(Array(filters.length)).map(v => "")];
    
    let predicates: Predicate<T[]>[] = new Array();

    filters.forEach(([index, strategy], i) => {
        predicates.push(data => {
            strategy.setFilter(() => values[i]);
            let tested = data.map(entry => strategy.filter([JSON.stringify(entry)]));
            if (tested.includes(true)) {
                return true;
            }
            if (tested.includes(false)) {
                return false;
            }
            return undefined;
        })
    });

    let crawler = new TableColumnFilterCrawler(predicates);

    $: {
        if (values.filter(v => v && v != "").length > 0) {
            setFilter(crawler);
        } else {
            setFilter(undefined);
        }
    }

</script>

<style lang=scss>


</style>

{#each [...filters] as options, i}
    <div class=filter>
        <div class=name>{options[1].toDisplayData()[0]}</div>
        <input class=value bind:value={values[i]}>
    </div>
{/each}
