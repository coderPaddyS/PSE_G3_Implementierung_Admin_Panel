<script lang=ts>
    
    type T = $$Generic<string | number>;
    export let start: T;
    let value = start;
    let oldValue = start;
    export let text: string;
    export let update: (value: T) => void;

    function passNumbers(n: string): string {
        let acc: string = "";
        for (let c of n) {
            if ("0" <= c && c <= "9") {
                acc += c;
            }
        }
        return acc;
    }

    $:  if (typeof start === 'number') {
            if (value != undefined && value != null && value == passNumbers(String(value))) {
                update(value);
                oldValue = value;
            } else {
                value = oldValue as T;
            }
        } else {
            update(value);
            oldValue = value;
        }
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
        <input bind:value={value} type="number" pattern="\d+" step="1">
    {:else}
        <input bind:value={value}>
    {/if}
</div>