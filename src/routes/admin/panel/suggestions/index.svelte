<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import SvelteTable from "$lib/view/components/table/SvelteTable.svelte"
    import { Framework } from "$lib/controller/framework";
    import { Tables } from "$lib/model/tables/Tables";
    import Waiting from "$lib/view/Waiting.svelte";
    import Action from "$lib/view/components/table_actions/Action.svelte";

    let framework = Framework.getInstance();
    let {supplier, updater, filterableData} = framework.getTableDisplayInformation(Tables.ALIAS_SUGGESTIONS);
    framework.setActionComponentFactory(
        Tables.ALIAS_SUGGESTIONS, 
        (onClick, text) => ((root, props) => {
            return new Action({
                target: root,
                props: {
                    onClick,
                    text,
                    ...props
                }
            })
        })
    )
</script>

{#await supplier()}
    <Waiting text={"Rufe Daten vom Server ab"} />
{:then data}
    <SvelteTable supplier={() => data} {updater} {filterableData} size=5em />
{/await}