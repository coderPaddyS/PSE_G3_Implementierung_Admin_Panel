<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->
    
<script lang=ts>
    import { goto } from "$app/navigation";

    // Redirect instantly to the admin-index
    // Replace the browser history entry by the redirection to avoid an infinite loop back
    goto('/admin', {
        replaceState: true
    });
</script>