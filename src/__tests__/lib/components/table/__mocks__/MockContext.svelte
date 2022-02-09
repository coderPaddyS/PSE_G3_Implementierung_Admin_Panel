<script>
    import { setContext } from "svelte";
  
    export let component;
    export let key;
    export let value;
    export let props;
  
    setContext(key, value);
  </script>
  
  <svelte:component this={component} {...props} />