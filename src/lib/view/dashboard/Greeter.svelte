<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>

    // retreive the name und username
    export let name: string = undefined;
    export let username: string;

    /**
     * A function implementing a svelte animation for a typewriter animation
     * @param node The node of which the text should be animated
     * @param param1 An optional speed parameter to adjust the animation speed
     */
    function typewriter(node: Node, { speed = 1}) {
        let text = node.textContent;
        let duration = text.length / (0.025 * speed);

        return {
            duration,
            tick: t => {
                node.textContent = text.slice(0, Math.trunc(text.length * t));
            }
        }
    }
</script>

<style lang=scss>
    .greeter {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2em;
        padding: 2em;
    }
</style>

<div class=greeter>
    Hallo&nbsp;<span in:typewriter>{name? `${name} (${username})` : username}</span>!
</div>