<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
import { onMount } from "svelte";

    import cssVars from "svelte-css-vars"
    import type { TableComponent, iTableData, Table, TableCell, TableData, TableRow } from "../../model/table/TableComponents";
import TableRowComp from "./TableRowComp.svelte";
import TitleRowComp from "./TitleRowComp.svelte";

    type T = $$Generic;

    // Alter the minimum size of a column
    export let size;
    export let table: Table<T>;
    let root: HTMLElement;

    /**
     * Convert the given Data to the inner type.
     * Must be called only with type T, otherwise garbage will happen
     * @param data T
     */
    function toData(data: iTableData<T> | TableComponent<T>[]) : iTableData<T> {
        return data as iTableData<T>;
    }

    // Apply dynamic changes of size
    $: styleVars = {
        size: size
    }
</script>

<style lang=scss>
    .table {
        width: 100%;
        justify-content: center;
        align-items: center;
        background-color: #b00b69;
    }

    .titlerow {
        border-radius: 1em;
        background-color: #55c2dd;

        :global(.cell) {
            font-size: x-large;
            font-family: 'New Century Schoolbook', 'Courier New', Courier, monospace;
            font-weight: 600;
            color: white;
        }
    }

    .titlerow, .row {
        width: auto;
        display: grid;
        padding: 1em;
        grid-template-columns: repeat(auto-fit, minmax(var(--size), 1fr));
    }

    .titlecell {
        display: grid;
        grid-template-columns: 1fr 2em;
        padding-left: 2em;

        :global(.data) {
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }

    .cell {
        justify-content: center;
        align-items: center;
        text-align: center;
    }
</style>
{#if table !== undefined}
    <div class=table>
        {#if table.getTitle()}
            <TitleRowComp row={table.getTitle()} index={[0]} {size}/>
        {/if}
        {#if table.getChilds()}
            {#each table.getChilds() as row,i}
                <TableRowComp bind:row={row} index={[i]} {size} />
            {/each}
        {/if}
    </div>
{/if}
<!-- Traverse each child of the current iTableComponent -->
<!-- {#each data as entry, i} -->
    <!-- {#if entry !== undefined} -->

        <!-- <div class={entry.comp} use:cssVars={styleVars}> -->
            <!-- If it is not a eTableData.Data Element, then it has childrens -->
            <!-- {#if entry.comp != eTableData.Data}  -->

                <!-- Therefore create a new TableComp child component with the child -->
                <!-- <svelte:self data={entry.data} {size} index={[...index, i]}/> -->

                <!-- If it has a sorting algorithm, then add a TableSort component -->
                <!-- {#if entry.hasOwnProperty('sorter') && entry['sorter'] !== undefined} -->
                    <!-- <TableSort algorithm={entry['sorter']} /> -->
                <!-- {/if} -->
            
            <!-- If it is TableData, display it -->
            <!-- {:else} -->
                <!-- <TableDataComp data={toData(entry.data)} index={tail([...index, i])} /> -->
            <!-- {/if} -->
        <!-- </div> -->
    <!-- {/if} -->
<!-- {/each} -->