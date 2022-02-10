<script lang=ts>
    export let errorSupplier: (listener: (errors: Array<Error | string>) => void) => void;
    export let remove: (error: Error | string) => void;

    let errors: Array<Error | string> = [];
    errorSupplier((e) => {
        errors = e;
    })
</script>

<style lang=scss>
    .errorbox {
        position: absolute;
    }
</style>

<div class=errorbox>
    {#each errors as error,i}
        <div class=error>
            <button on:click={() => remove(error)}></button>
            <div class=text>
                {error}
            </div>
        </div>
    {/each}
</div>