<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import SvelteTable from "$lib/view/components/table/SvelteTable.svelte"
    import { Framework } from "$lib/controller/framework";
    import { Tables } from "$lib/model/tables/Tables";
    import Waiting from "$lib/view/Waiting.svelte";
    import Action from "$lib/view/components/table_actions/Action.svelte";
import AdderToBlacklist from "$lib/view/adder/AdderToBlacklist.svelte";

    let framework = Framework.getInstance();
    let {supplier, updater, filterableData} = framework.getTableDisplayInformation(Tables.BLACKLIST);
    
    // Set the table to use the Action component to display the actions
    framework.setActionComponentFactory(
        Tables.BLACKLIST, 
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

<svelte:head><title>Blacklist - Admin-Panel - KIT-Finder</title></svelte:head>

<AdderToBlacklist text="Hinzufügen" onClick={(value) => framework.addToBlacklist(value)} />
{#await supplier()}
    <Waiting text={"Rufe Daten vom Server ab"} />
{:then data}
    <SvelteTable supplier={() => data} {updater} {filterableData} styling=15em />
{/await}
