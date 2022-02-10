<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { goto } from "$app/navigation";
import ErrorMessage from "$lib/components/error/ErrorMessage.svelte";
import { Framework } from "$lib/controller/framework";

import { onMount } from "svelte";
    
    Framework.getInstance().onAuthenticationUpdate((isAuthenticated) => {
        if (!isAuthenticated) {
            goto("/admin", {
                replaceState: true
            });
        }
    })

    let errorbox: HTMLElement;

    onMount(() => {
        if (errorbox) {
            Framework.getInstance().onError((error) => errorbox.textContent = error.toString());
        }
        if (!Framework.getInstance().isAuthenticated()) {
            console.log("not logged in");
            goto('/admin', {
                replaceState: true
            });
        }
    })
</script>

<style lang="scss">

    @mixin mobile () {
        @media only screen and (max-width: 600px) {
            @content;
        }
    }

    @mixin desktop () {
        @media only screen and (min-width: 600px) {
            @content;
        }
    }

    .wrapper {
        display: flex;
        overflow: hidden;
        width: 100%;
        height: 100%;

        @include desktop() {
            flex-direction: row;
        }

        @include mobile() {
            position: absolute;
            flex-direction: column-reverse;
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        height: 100vh;
        background-color: rgba($color: #AAA, $alpha: 0.8);
        overflow: scroll;

        & :global(.title) {
            display: flex;
            width: 100%;

            justify-content: center;
            margin-top: 5em;
        }
    }

    .nav {
        display: flex;
        flex-direction: column;
        padding: 1em;
        margin: 0;
        background-color: #b8740d;
        transition: all 0.25s;
        overflow: hidden;

        @include mobile() {
            max-height: 0;
            bottom: 0;
            padding-top: 4em;
            overflow: scroll;

            & * {
                max-height: 0;
                transition: all 0.25s;
            }

            &:hover {
                &, & * {
                    padding-top: 1em;
                    max-height: 20em;
                    transition: all 0.25s;
                }
            }
        }
        
        @include desktop() {
            max-width: 0;
            & * {
                max-width: 0;
                transition: all 0.25s;
            }

            &:hover {
                &, & * {
                    max-width: 20em;
                    transition: max-width 0.25s;
                }
            }
        }

        .navitem, .logout {

            &:hover {
                background-color: lighten($color: #b8740d, $amount: 10);

                :global(a) {
                    color: red;
                }
            }
            padding: 1em;
            border-radius: 1em;
            
            :global(a) {

                display: block;
                text-decoration: none;
                color: black;
                margin: 0;
                transition: color 0.25s;
            }
        }

        .logout {
            margin: auto auto 0 auto;
            display: flex;
            
            :global(button) {
                display: flex;
                flex-grow: 1;
                border-radius: 1em;
            }
        }
    }
</style>

<ErrorMessage 
    remove={(error) => Framework.getInstance().removeError(error)}
    errorSupplier={(listener) => Framework.getInstance().onError(listener)}
/>
<main class=wrapper>
    <div class="nav">
        <div class="navitem"><a href=/admin/panel>Dashboard                     </a></div>
        <div class="navitem"><a href=/admin/panel/suggestions>Alias-Vorschläge  </a></div>
        <div class="navitem"><a href=/admin/panel/alias>Offizielle Aliasse      </a></div>
        <div class="navitem"><a href=/admin/panel/blacklist>Blacklist           </a></div>
        <div class="navitem"><a href=/admin/panel/changes>Änderungen            </a></div>
        <div class=logout>
            <button on:click={() => Framework.getInstance().logout()}> Logout </button>
        </div>
    </div>
    <div class=content>
        <slot />
    </div>
</main>