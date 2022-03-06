<script lang=ts>
    
    type T = $$Generic;
    export let start: T;
    let value = start;
    export let text: string;
    export let update: (value: T) => void;

    $: update(value);
</script>

<style lang=scss>
    @import '../../../../global.scss';
    
    .setting {
        display: flex;
        padding: calc(0.5rem);
        width: 100%;

        span {
            width: 75%;
            text-align: center;
        }
    }
</style>

<div class=setting>
    <span>{text? text : ""}</span>
    {#if typeof start === 'number'}
        <input bind:value={value} type="number">
    {:else}
        <input bind:value={value}>
    {/if}
</div>