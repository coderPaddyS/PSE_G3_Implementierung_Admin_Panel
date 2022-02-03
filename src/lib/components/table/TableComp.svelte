<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { Table } from "../../model/table/TableComponents";
    import TableRowComp from "./TableRowComp.svelte";
    import TitleRowComp from "./TitleRowComp.svelte";

    // Generic Type T 
    type T = $$Generic;

    // A styling variable to alter sizes simultaneously
    export let size;
    export let table: Table<T>;
</script>

<style lang=scss>
    .table {
        width: 100%;
        justify-content: center;
        align-items: center;
        background-color: #b00b69;
    }

</style>

{#if table !== undefined && !table.isHidden()}
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