<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import SvelteTable from "$lib/components/table/SvelteTable.svelte"
    import { Framework } from "$lib/controller/framework";
import { Tables } from "$lib/model/tables/Tables";

    let framework = Framework.getInstance();
    let {supplier, updater, filterableData} = framework.getTableDisplayInformation(Tables.BLACKLIST);

</script>

{#await supplier()}
    Loading...
{:then data}
    <SvelteTable supplier={() => data} {updater} {filterableData} size=5em />
{/await}
