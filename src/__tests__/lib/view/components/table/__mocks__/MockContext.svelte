<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<!-- 2022, Patrick Schneider <patrick@itermori.de> -->

<script>
    import { setContext } from "svelte";
  
    export let component;
    export let key;
    export let value;
    export let props;
  
    setContext(key, value);
</script>

<svelte:component this={component} {...props} />