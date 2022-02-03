<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import SvelteTable from "$lib/components/table/SvelteTable.svelte"
    import FilterElement from "$lib/components/table/FilterElement.svelte";
    import { Framework } from "$lib/controller/framework";

    let framework = Framework.getInstance();

    let filterOptions: Map<String, String> = new Map([["Filter", "Option"], ["Filter2", "Option2"]])
</script>

<FilterElement {filterOptions} />
<SvelteTable supplier={async () => framework.getOfficialAliases()} updater={(listener) => framework.onOfficialAliasesUpdate(listener)} size=5em />