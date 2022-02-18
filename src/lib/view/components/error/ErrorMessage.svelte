<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>

    // Functions to retreive the errors and to delete them
    export let errorSupplier: (listener: (errors: Array<Error | string>) => void) => void;
    export let remove: (error: Error | string) => void;

    let errors: Array<Error | string> = [];

    // Register the listener
    errorSupplier((e) => {
        errors = e;
    })
</script>

<style lang=scss>

    @use "sass:color";
    @import "../../../../global.scss";

    .errorbox {
        position: absolute;
        display: block;
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        background-color: #ff183f;
        border-radius: 1em;

        @include desktop() {
            width: 25%;
        }

        @include mobile() {
            width: fit-content;
        }

        .error {

            display: flex;
            flex-direction: row-reverse;
            border-radius: inherit;
            padding: 1em;

            &:hover {
                background-color: rgb(238, 40, 40)            
            }

            button {
                display: flex;
                border-color: transparent;
                background-color: inherit;
                border-radius: 0.5em;
                justify-content: center;
                align-items: center;

                &:hover {
                    background-color: #ff2a2a;
                }
            }

            .text {
                width: fit-content;
                flex-grow: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }
</style>

<div class=errorbox>
    {#each errors as error,i}
        <div class=error>
            <button on:click={() => remove(error)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" transform="translate(1 1)"><path d="M12 0L0 12M0 0l12 12"/></g></svg>
            </button>
            <div class=text>
                {error}
            </div>
        </div>
    {/each}
</div>