<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>

    // The text to be shown on the button
    export let text: string;

    // Listeners to be executed 
    export let onClick: Array<(() => void)> = [];

</script>

<style lang="scss">

</style>

<button on:click={() => onClick.forEach((callback) => callback())}>{text}</button>