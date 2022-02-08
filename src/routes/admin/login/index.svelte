<script lang=ts>
    import { Framework } from "$lib/controller/framework";
    Framework.getInstance().redirectAfterLogin()
</script>

<style lang=scss>
    main {
        display: flex;
        flex-direction: column;
        width: fit-content;
        height: fit-content;
        margin: auto;
    }
    h1 {
      font: 1.5em 'Roboto', sans-serif;
      margin-bottom: 30px;
    }
    .spinner {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 3px solid rgb(104, 90, 90);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
      -webkit-animation: spin 1s ease-in-out infinite;
      margin: auto;
    }
    @keyframes spin {
      to {
        -webkit-transform: rotate(360deg);
      }
    }
    @-webkit-keyframes spin {
      to {
        -webkit-transform: rotate(360deg);
      }
    }
</style>

<main>
    <h1>Logging in</h1>
    <div class="spinner"/>
</main>