<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->
    
<script lang=ts>

    // The text which should be displayed.
    export let text: string;
</script>

<style lang=scss>
    .waiting {
        display: flex;
        flex-direction: column;
        width: fit-content;
        height: fit-content;
        margin: auto;

        h1 {
            font: 1.5em 'Roboto', sans-serif;
            margin-bottom: 30px;
        }

        .spinner {
            display: inline-block;
            width: 50px;
            height: 50px;
            border: 3px solid rgb(104, 90, 90);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            -webkit-animation: spin 1s ease-in-out infinite;
            margin: auto;
        }
    }

    @keyframes spin {
        to {
            -webkit-transform: rotate(360deg);
        }
    }
    @-webkit-keyframes spin {
        to {
            -webkit-transform: rotate(360deg);
        }
    }
</style>

<div class=waiting>
    <h1>{text ? text : ""}</h1>
    <div class="spinner"/>
</div>