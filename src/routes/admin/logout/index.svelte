<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { Framework } from "$lib/controller/framework";
    import Waiting from "$lib/view/Waiting.svelte";
    Framework.getInstance().redirectAfterLogout()
</script>

<style lang=scss>
    main {
        display: flex;
        flex-direction: column;
        width: fit-content;
        height: fit-content;
        margin: auto;
    }
</style>

<main>
    <Waiting text={"Logging in"} />
</main> 