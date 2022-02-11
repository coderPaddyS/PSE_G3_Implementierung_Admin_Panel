<script lang=ts>
    import { Framework } from "$lib/controller/framework";
import Waiting from "$lib/view/Waiting.svelte";
    let framework = Framework.getInstance();

    framework.redirectAfterLogin();
</script>

<style lang=scss>

</style>

<main>
    <Waiting text={"Logging in"} />
</main> 