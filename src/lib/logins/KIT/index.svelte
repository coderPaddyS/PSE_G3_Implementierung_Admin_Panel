<script lang=ts>
    import {login, OIDC_CONTEXT_CLIENT_PROMISE, OIDC_CONTEXT_REDIRECT_URI} from '@dopry/svelte-oidc/src/components/OidcContext.svelte';
    import type { UserManager } from 'oidc-client';
    import { getContext } from 'svelte';
    export let oidcPromise: Promise<typeof UserManager> = getContext(OIDC_CONTEXT_CLIENT_PROMISE);
    export let callback_url: string = getContext(OIDC_CONTEXT_REDIRECT_URI);
    export let preserveRoute: boolean = true;
</script>

<style lang=scss>

    $kit-green: #009682cc;

    .wrapper {

        display: flex;
        width: fit-content;
        padding: 0.25em;
        background-color: $kit-green;
        border-radius: 1em;
        justify-content: center;
        align-items: center;

        &:hover {
            background-color: lighten($color: $kit-green, $amount: 10);
            transition: background-color 0.25s;
        }

        button {
            background-color: transparent;
            color: black;
            border: none;
            white-space: nowrap;
        }

        img {
            height: 2em;
            width: auto;
            padding: 0.5em;
            border-radius: 1em;
            background-color: white;
        }
    }

</style>

<div class=wrapper on:click={() => login(oidcPromise, preserveRoute, callback_url) }>
    <img src=logins/Logo_KIT.svg alt="KIT">
    <button>Login via KIT</button>
</div>
