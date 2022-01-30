<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>

    export let filterOptions: Map<String, String> = new Map();

</script>

<style lang=scss>


</style>

{#each [...filterOptions] as options}
    {options[0]}
    {options[1]}
{/each}
