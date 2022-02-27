<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { goto } from "$app/navigation";

    import { Framework } from "$lib/controller/framework";
    import Waiting from "$lib/view/Waiting.svelte";
    Framework.getInstance().redirectAfterLogin((href: string) => goto(href, {replaceState: true}));
</script>

<style lang=scss>

</style>

<main>
    <Waiting text={"Logging in"} />
</main> 