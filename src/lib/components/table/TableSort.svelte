<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts context=module>
    // This special script section is shared with other components to share a given state

    /**
     * The possible states a sorting element can be in.
     */
    enum SortState {

        /** Apply no sorting */
        NONE = 0,

        /** Apply the given sorting strategy */
        ASCENDEND = 1, 

        /** Apply the reversed sorting strategy */
        DESCENDEND = 2
    }

    namespace SortState {

        /**
         * Retreive the next SortState according to the given one.
         * @param state {@link SortState} - the current state
         */
        export function next(state: SortState): SortState {
            return (state + 1) % 3
        }
    }

    /** The current sorting elements active in this context */
    const sortElementsReset: Set<() => void> = new Set();
</script>

<script lang=ts>
    import { getContext, onMount } from "svelte/internal";
    import { crawlerKey, invertSort, Sorter } from "$lib/model/table/Types";
    import { TableSortingCrawler } from "$lib/model/table/crawler/SortingCrawler";
    import type { TableRow } from "$lib/model/table/TableComponents";

    // Define the generic type:
    //  R   -   R extends TableRow<T>
    type T = $$Generic
    type R = $$Generic<TableRow<T>>

    // Retreive the context of the table to change the sorting behaviour
    const { sorter } = getContext(crawlerKey);

    // The current sorting state of this sorting element
    let state: SortState = SortState.NONE;

    /** The sorting algorithm which should be applied. See {@link iTableRow}*/
    export let algorithm: Sorter<R>;
    const identity: Sorter<R> = (a, b) => [a,b];

    // The crawlers to sort by
    let identitySorter: TableSortingCrawler<T>;
    let ascSorter: TableSortingCrawler<T>;
    let descSorter: TableSortingCrawler<T>;

    /**
     * Advance the sorting state of this sorting element.
     * Does reset all other sorting elements in the current context.
     */
    function nextState() {
        resetOthers();
        state = SortState.next(state);
        setSorting(state);
    }

    /**
     * Reset any other sorting element which is present in the current context.
     */
    function resetOthers() {
        sortElementsReset.forEach(r => {
            if (reset !== r) {
                r();
            }
        })
    }

    /**
     * Set the sorting Algorithm according to the current sorting state.
     * @param state {@link SortState} - The state of this sorting element
     */
    function setSorting(state: SortState) {
        switch (state) {
            case SortState.NONE: sorter(identitySorter); break;
            case SortState.ASCENDEND: sorter(ascSorter); break;
            case SortState.DESCENDEND: sorter(descSorter); break;
        }
    }

    /**
     * Reset this sorting element to apply no sort.
     */
    export function reset() {
        state = SortState.NONE;
    }

    // If the component is loaded by the browser and therefore gets visible
    onMount(() => {
        // Add this sorting element to the context for state management
        sortElementsReset.add(reset);

        // Create the sorter and set sorting state
        identitySorter = new TableSortingCrawler(identity);
        ascSorter = new TableSortingCrawler(algorithm);
        descSorter = new TableSortingCrawler(invertSort(algorithm));
        setSorting(state);
    })
</script>

<style lang=scss>
    svg {
        display: flex;
        flex-direction: row-reverse;
        width: 2em;
    }
</style>

<div class=sorting-element on:click={nextState}>
    {#if state == SortState.NONE}
        <svg class=identity xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.29,14.29,12,18.59l-4.29-4.3a1,1,0,0,0-1.42,1.42l5,5a1,1,0,0,0,1.42,0l5-5a1,1,0,0,0-1.42-1.42ZM7.71,9.71,12,5.41l4.29,4.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-5-5a1,1,0,0,0-1.42,0l-5,5A1,1,0,0,0,7.71,9.71Z"/></svg>
    {:else if state == SortState.ASCENDEND}
        <svg class=asc xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m 16.290001,9.7117068 -4.29,-4.2999997 -4.2900012,4.2999997 a 1.0040916,1.0040916 0 0 1 -1.42,-1.4199997 l 5.0000012,-5 a 1,1 0 0 1 1.42,0 l 5,5 a 1.0040916,1.0040916 0 0 1 -1.42,1.4199997 z"/></svg>
    {:else}
        <svg class=desc xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.29,14.29,12,18.59l-4.29-4.3a1,1,0,0,0-1.42,1.42l5,5a1,1,0,0,0,1.42,0l5-5a1,1,0,0,0-1.42-1.42ZM7.71"/></svg>
    {/if}
</div>