<script lang=ts>
import { cubicOut } from "svelte/easing";

import { tweened } from "svelte/motion";
import { fly } from "svelte/transition";



    export let size: number;
    export let title: string;

    let value = tweened(0, {
        duration: 1000,
        easing: cubicOut
    });

    value.set(size);

</script>

<style lang=scss>
    .overview {
        display: box;
        width: 100%;
        height: 100%;
        border-radius: 1em;
        background-color: #9b9e98;
        align-items: center;
        justify-content: center;

        .name {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
        }

        .size {
            display: flex;
            flex-grow: 1;
            align-items: center;
            justify-content: center;
            font-size: 4em;
            font-weight: 800;
        }
    }
</style>

<div class=overview in:fly={{y: 500}}>
    <div class=name>
        {title}
    </div>
    <div class=size>
        {Math.floor($value)}
    </div>
</div>