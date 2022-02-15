<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { TableColumnFilterCrawler } from "$lib/model/recursive_table/crawler/ColumnFilterCrawler";
    import { crawlerKey, Predicate } from "$lib/model/recursive_table/Types";
    import type { FilterStrategy } from "$lib/model/tables/manager/filter/FilterStrategy";
    import { getContext } from "svelte";

    const { setFilter } = getContext(crawlerKey);

    type T = $$Generic;
    export let filters: [number, FilterStrategy<string>][];

    // Start with an empty string for every filter
    let values: string[] = [...Array.from(Array(filters.length)).map(v => "")];
    
    let predicates: Predicate<T[]>[] = new Array();

    // Create a predicate for each filter using its strategy to filter
    filters.forEach(([, strategy], i) => {
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

    let show: boolean = false;

    $: {
        if (values.filter(v => v && v != "").length > 0) {
            setFilter(crawler);
        } else {
            setFilter(undefined);
        }
    }

</script>

<style lang=scss>
    .filters {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0.5em;
        border-radius: 1em;
        width: fit-content;
        max-width: 75%;
        background-color: #ABABAB;

        .drop {
            height: 2em;
            display: flex;
            flex-direction: row;

            svg {
                height: 100%;
            }

            p {
                display: flex;
                flex-grow: 1;
                font-size: 1.25em;
                font-weight: 400;
                margin: auto 1em auto 1em;
                align-items: center;
                justify-content: center;
            }
        }

        .wrapper {
            display: grid;
            gap: 0.5em;
            padding: 0.5em;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

            .filter {
                display: flex;
                flex-direction: row;

                .name {
                    display: flex;
                    align-items: center;
                    width: 7.5em;
                }

                .value {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    border-radius: 0.5em;
                    flex-grow: 1;
                }
            }
        }
    }

</style>

<div class=filters>
    <div class=drop on:click={() => show = !show}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 99.75 97.32"><g data-name="Layer 2"><path d="M89.32 0H10.43a10.43 10.43 0 0 0 0 20.85h78.9A10.43 10.43 0 0 0 89.32 0zM89.32 38.23H10.43a10.43 10.43 0 0 0 0 20.85h78.9a10.43 10.43 0 0 0 0-20.85zM89.32 76.47H10.43a10.43 10.43 0 0 0 0 20.85h78.9a10.43 10.43 0 0 0 0-20.85z" data-name="Layer 1"/></g></svg>
        <p>Filtereinstellungen</p>
    </div>
    {#if show}
        <div class=wrapper>
            {#each [...filters] as options, i}
                <div class=filter>
                    <div class=name>{options[1].toDisplayData()[0]}</div>
                    <input class=value bind:value={values[i]}>
                </div>
            {/each}
        </div>
    {/if}
</div>
