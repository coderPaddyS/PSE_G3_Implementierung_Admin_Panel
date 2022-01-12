<script lang=ts>
    import init, { Greeter } from "kit-finder";
    init().then(() => {
        let greeter = Greeter.new("Patrick");
        greeter.greet();
    });
</script>

<style lang="scss">

</style>