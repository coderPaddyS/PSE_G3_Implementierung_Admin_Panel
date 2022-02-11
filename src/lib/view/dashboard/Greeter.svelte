<script lang=ts>
    export let name: string = undefined;
    export let username: string;

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