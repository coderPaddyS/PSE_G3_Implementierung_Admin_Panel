<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { goto } from "$app/navigation";
    import ErrorMessage from "$lib/view/components/error/ErrorMessage.svelte";
    import { Framework } from "$lib/controller/framework";

    import { onMount } from "svelte";

    let framework = Framework.getInstance();
    
    framework.onAuthenticationUpdate(async (isAuthenticated) => {
        if (!isAuthenticated || !await framework.isAdmin()) {
            framework.addError("Nur Administratoren haben Zugriff auf diesen Bereich!");
            goto("/admin", {
                replaceState: true
            });
        }
    })

    onMount(async () => {
        if (!framework.isAuthenticated() || !await framework.isAdmin()) {
            framework.addError("Nur Administratoren haben Zugriff auf diesen Bereich!");
            goto("/admin", {
                replaceState: true
            });
        }
    })
</script>

<style lang="scss">

    @import '../../../global.scss';

    .wrapper {
        display: flex;
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
        background-color: $con_bg_color;
        overflow: auto;
    }

    .navigation {
        display: flex;
        flex-direction: column;
        padding: $nav_padding;
        margin: 0;
        background-color: $nav_bg_color;
        overflow: hidden;

        &, & * {
            transition: all $anim_speed;
        }

        .navitems {
            display: flex;
            flex-direction: column;
            flex-grow: 1;

            .navitem {
                display: flex;
                border-radius: 1em;
            }
            .navitem {
                .item {
                    display: flex;
                    text-decoration: none;
                    color: black;
                    margin: 0;
                    padding: $nav_padding;
                    width: 100%;
                    border-radius: inherit;

                    &:hover {
                        background-color: $nav_bg_color_highlighted;
                    }

                }
            }

            .logout {
                margin-top: auto;

                .item {
                    border-color: transparent;
                    text-align: left;
                    background-color: $nav_bg_color;
                }
            }
        }

        .logo{
            display: flex;
            flex-direction: row;   
            height: 3em; 

            h1 {
                margin: auto;
            }
        }

        @include desktop() {

            &, & * {
                max-width: 0;
            }

            & * {
                opacity: 0;
            }

            &:hover, &:hover * {
                max-width: $nav_width;
                opacity: 1;
            }

            &:not(:hover) {
                width: fit-content;
                max-width: fit-content;
                padding: $nav_padding;
                margin: 0;

                .logo:not(:hover) {
                    display: flex;
                    flex-direction: column;
                    max-width: $nav_width_closed;
                    opacity: 1;
                    height: auto;
                    padding: 0;
                    margin: 0;
                    justify-content: center;
                    gap: 1em;

                    img:not(:hover) {
                        transform: rotate(90deg);
                    }

                    img:not(:hover),
                    h1:not(:hover) {
                        max-width: $nav_width_closed;
                        width: $nav_width_closed;
                        opacity: 1;
                        writing-mode: vertical-lr;
                    }
                }
            }

            .navitems {
                width: 100%;
            }
        }

        @include mobile() {
            max-height: 0;
            bottom: 0;

            &:not(:hover) {
                height: fit-content;
                max-height: fit-content;
                padding: $nav_padding;
                margin: 0;
                overflow: hidden;
                text-align: center;

                & * {
                    display: none;
                    max-height: 0;
                }

                .logo:not(:hover) {
                    max-height: $nav_height_closed;
                    opacity: 1;

                    img:not(:hover),
                    h1:not(:hover) {
                        display: block;
                        max-height: $nav_height_closed;
                        height: $nav_height_closed;
                        opacity: 1;
                        margin: auto;
                    }
                }
            }

            & * {
                max-height: 0;
                transition: all 0.25s;
            }

            &:hover {
                overflow: scroll;

                .logo {
                    text-align: center;
                }
                
                &, & * {
                    padding-top: 1em;
                    max-height: 20em;
                    transition: all 0.25s;
                }
            }
        }
    }
</style>

<ErrorMessage 
    remove={(error) => Framework.getInstance().removeError(error)}
    errorSupplier={(listener) => Framework.getInstance().onError(listener)}
/>
<main class=wrapper>
    <div class=navigation>
        <div class=logo>
            <img src=/static/favicon.png alt="">
            <h1>KIT-Roomfinder</h1>
        </div>
        <div class="navitems">
            <div class="navitem"><a class=item href=/admin/panel>Dashboard                     </a></div>
            <div class="navitem"><a class=item href=/admin/panel/suggestions>Alias-Vorschläge  </a></div>
            <div class="navitem"><a class=item href=/admin/panel/alias>Offizielle Aliasse      </a></div>
            <div class="navitem"><a class=item href=/admin/panel/blacklist>Blacklist           </a></div>
            <div class="navitem"><a class=item href=/admin/panel/changes>Änderungen            </a></div>
            <div class="logout navitem">
                <button class=item on:click={() => Framework.getInstance().logout()}> Logout </button>
            </div>
        </div>
    </div>
    <div class=content>
        <slot />
    </div>
</main>