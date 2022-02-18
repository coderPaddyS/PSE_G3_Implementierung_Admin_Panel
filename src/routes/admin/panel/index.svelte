<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { Framework } from "$lib/controller/framework";
    import TableOverview from "$lib/view/components/table/TableOverview.svelte";
    import type { UserData } from "$lib/controller/backend";
    import Greeter from "$lib/view/dashboard/Greeter.svelte";
    import Waiting from "$lib/view/Waiting.svelte";
    import { Tables } from "$lib/model/tables/Tables";

    let framework = Framework.getInstance();
    let userData: UserData = framework.getUserData();
    let username: string;
    let name: string;

    if (userData) {
        username = userData.preferred_username;
        name = userData.name;
    }

    /**
     * Retreive all tables with size and title, but skip Tables.CHANGES as we are not interested in showing it.
     */
    async function getTables(): Promise<{size: number, title: string}[]> {
        let tables: {size: number, title: string}[] = [];
        let availableTables = framework.getTables();
        for (let i = 0; i < availableTables.length; ++i) {
            if (availableTables[i] == Tables.CHANGES) {
                continue;
            }
            let { size, tableTitle } = framework.getTableDisplayInformation(availableTables[i]);
            let table = {
                size: await size(),
                title: tableTitle(),
            }
            tables.push(table);
        }
        return tables;
    }
</script>

<style lang=scss>
    .stats {
        display: grid;
        gap: 1em;
        margin: 1em;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
</style>

<svelte:head><title>Dashboard - Admin-Panel - KIT-Finder</title></svelte:head>


<Greeter {username} {name} />

{#await getTables()}
    <Waiting text={"Rufe Daten vom Server ab"} />
{:then tables}
    <div class=stats>
        {#each tables as {size, title}}
            <TableOverview {size} {title} />
        {/each}
    </div>
{/await}