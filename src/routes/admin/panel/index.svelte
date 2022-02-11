<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { Framework } from "$lib/controller/framework";
    import TableOverview from "$lib/view/components/table/TableOverview.svelte";
    import type { UserData } from "$lib/controller/backend";
    import Greeter from "$lib/view/dashboard/Greeter.svelte";

    let framework = Framework.getInstance();
    let userData: UserData = framework.getUserData();
    let username: string;
    let name: string;

    if (userData) {
        username = userData.preferred_username;
        name = userData.name;
    }

    async function getTables(): Promise<{size: number, title: string}[]> {
        let tables: {size: number, title: string}[] = [];
        let availableTables = framework.getTables();
        for (let i = 0; i < availableTables.length; ++i) {
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
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
</style>

<Greeter {username} {name} />

{#await getTables()}
    Loading...
{:then tables}
    <div class=stats>
        {#each tables as {size, title}}
            <TableOverview {size} {title} />
        {/each}
    </div>
{/await}