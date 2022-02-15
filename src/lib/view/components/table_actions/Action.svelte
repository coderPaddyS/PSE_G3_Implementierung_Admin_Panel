<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>

    // The text to be shown on the button
    export let text: string;

    // Listeners to be executed 
    export let onClick: Array<(() => void)> = [];

    function handleOnClick() {
        if (onClick) {
            onClick.forEach((callback) => callback())
        }
    }

</script>

<style lang="scss">
    button {
        padding: 0;
        font-size: 0.75rem;
    }
</style>

<button on:click={handleOnClick}>{text? text : ""}</button>