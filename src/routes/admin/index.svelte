<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script>
    import { goto } from '$app/navigation'
import ErrorMessage from '$lib/components/error/ErrorMessage.svelte';
    import { Framework } from '$lib/controller/framework';

    import KITLogin from '$lib/logins/KIT/index.svelte'

    Framework.getInstance().onAuthenticationUpdate((isAuthenticated) => {
        if (isAuthenticated) {
            goto("/admin/panel", {
                replaceState: false
            })
        }
    });

    if (Framework.getInstance().isAuthenticated()) {
        goto("/admin/panel", {
            replaceState: false
        })
    }
</script>

<style lang=scss>

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

    main {
        display: flex;
        justify-content: center;
        height: 100%;
        background-color: #b8740d;
    }

    .wrapper {
        display: grid;
        @include desktop() {
            grid-template: 
            'Content Content Login'
            'Content Content Login'
            'Links Links Links';
        }

        @include mobile() {
            grid-template: 'Content' 'Login' 'Links';
        }
        gap: 1em;
        background-color: rgba($color: #AAA, $alpha: 0.8);
        border-radius: 2em;
        padding: 1em;
        max-width: 50vw;
        min-height: 50vh;
        max-height: 80vh;
        margin: auto;

        .content {
            grid-area: Content;
            background-color: #CCC;
            border-radius: 1em;
            height: 100%;
            width: 100%;
        }

        .login-wrapper {
            
            grid-area: Login;
            background-color: #CCC;
            border-radius: 1em;
            display: flex;
            flex-direction: column;

            h2 {
                display: flex;
                justify-content: center;
                background-color: white;
                margin: 0;
                border-radius: 1em;
                padding: 1.4em;
            }

            .logins {
                padding: 1em;
                display: grid;
            }
        }

        .links {
            grid-area: Links;
            display: flex;
            width: 100%;
            height: 100%;
            border-radius: 1em;
            background-color: #CCC;
            justify-content: center;
            align-items: center;

            .github {
                display: flex;
                border-radius: 1em;
                background-color: #333;
                justify-content: center;
                align-items: center;
                margin: 0.5em;

                text-decoration: 0;
                color: white;
                font-family: 'Courier New', Courier, monospace;

                svg {
                    width: 5em;
                    fill: white;
                }

                p {
                    display: block;
                    margin-right: 1em;
                }
            }
        }
    }

</style>

<ErrorMessage 
    remove={(error) => Framework.getInstance().removeError(error)}
    errorSupplier={(listener) => Framework.getInstance().onError(listener)}
/>
<main>
    <div class=wrapper>
        <div class=content>
            <slot name=content></slot>
        </div>
        <div class=login-wrapper>
            <h2>Admin?</h2>
            <div class=logins>
                <KITLogin login={async () => await Framework.getInstance().login()} />
            </div>
        </div>
        <div class=links>
            <a href=https://github.com/coderPaddyS/PSE_G3_Entwurf class=github>
                <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
                    <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                <p>Besuche unser Repo!</p>
            </a>
        </div>
    </div>
</main>