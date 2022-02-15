<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { Table } from "$lib/model/recursive_table/TableComponents";
    import SubTableRowComp from "./SubTableRowComp.svelte";
    import TitleRowComp from "./TitleRowComp.svelte";

    // Generic Type T 
    type T = $$Generic;

    // A styling variable to alter sizes simultaneously
    export let styling;
    export let table: Table<T>;
</script>

<style lang=scss>
    @import '../../../../global.scss';

    .table {
        width: 100%;
        justify-content: center;
        align-items: center;        
    }
</style>

{#if table !== undefined && !table.isHidden()}
    <div class=table>
        {#if table.getTitle()}
            <TitleRowComp row={table.getTitle()} index={[0]} {styling}/>
        {/if}
        {#if table.getChildren()}
            {#each table.getChildren() as row,i}
                <SubTableRowComp bind:row={row} index={[i]} {styling} />
            {/each}
        {/if}
    </div>
{/if}