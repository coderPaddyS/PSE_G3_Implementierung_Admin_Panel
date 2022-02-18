<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
import { Framework } from "$lib/controller/framework";

    export let text: string;

    let framework = Framework.getInstance();
    let value: string = "";
    
    function handleOnClick() {
        if (value && value.trim().length > 0) {
            framework.addToBlacklist(value);
            value = "";
        }
    }
</script>

<style lang=scss>
    @import "../../../global.scss";

    .adder {
        display: flex;
        width: auto;
        margin: 1em;
        padding: 1em;
        border-radius: 1em;
        background-color: lighten($color: $con_bg_color, $amount: 10);

        @include desktop() {
            flex-direction: row;
        }

        @include mobile() {
            flex-direction: column;
        }

        input {
            display: block;
            text-align: center;
            border-radius: 1em;
            width: 100%;
        }

        button {
            display: block;
            border-radius: 1em;
        }
    }
</style>

<div class=adder>
    <input class=blacklist bind:value={value} />
    <button on:click={handleOnClick}>{text}</button>
</div>