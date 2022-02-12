<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import type { LoginConfiguration } from "$lib/controller/backend";

    // retreive methods to configure the login and login
    export let configure: (config: LoginConfiguration) => void;
    export let login: () => void;

    function handleOnClick() {
        configure({
                loginRedirectURI: new URL(`${window.location.origin}/admin`),
                logoutRedirectURI: new URL(`${window.location.origin}/admin`),
                settings: {
                    authority: "https://oidc.scc.kit.edu/auth/realms/kit/",
                    client_id: "pse-itermori-de",
                    redirect_uri: `${window.location.origin}/admin/login`,
                    response_type: "code",
                    scope: "openid profile email",
                    automaticSilentRenew: true
                }
        });
        
        login();
    }
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

<div class=wrapper on:click={handleOnClick}>
    <img src=logins/Logo_KIT.svg alt="KIT">
    <button>Login via KIT</button>
</div>
