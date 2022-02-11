<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script lang=ts>
    import { goto } from "$app/navigation";

    import ErrorMessage from "$lib/components/error/ErrorMessage.svelte";
    import { Framework } from "$lib/controller/framework";
import { onMount } from "svelte";

    let framework = Framework.getInstance();

    framework.onAuthenticationUpdate(async (isAuthenticated) => {
        if (isAuthenticated && await framework.isAdmin()) {
            goto("/admin/panel", {
                replaceState: false
            })
        } else {
            framework.addError("Nur Administratoren haben Zugriff auf diesen Bereich!");
        }
    });
</script>

<style lang=scss>

</style>

<ErrorMessage 
    remove={(error) => Framework.getInstance().removeError(error)}
    errorSupplier={(listener) => Framework.getInstance().onError(listener)}
/>
<slot />
