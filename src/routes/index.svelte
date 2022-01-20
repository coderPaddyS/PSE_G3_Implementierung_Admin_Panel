<script lang=ts>
    import { goto } from "$app/navigation";

    // Redirect instantly to the admin-index
    // Replace the browser history entry by the redirection to avoid an infinite loop back
    goto('/admin', {
        replaceState: true
    });

    // ********************************************************************************************************
    //
    // The authentication via wasm sadly does not work currently, as staticly linked libraries are required.
    // Therefore it can not be bundled.
    // A PR to resolve this issue is ongoing, maybe it is going to work in near future
    //
    // ********************************************************************************************************

    // import init, { Framework, ClientData } from "kifapwa";
    // import init from "$lib/kifapwa/pkg/kifapwa";
    // import { OIDCClientData, Framework } from "$lib/kifapwa/pkg/kifapwa";
    // import { onMount } from "svelte";

    // let url: string = undefined;

    // onMount(async () => {
    //     await init("../lib/kifapwa/pkg/kifapwa_bg.wasm");
    //     let params: URLSearchParams = $page.url.searchParams;
    //     console.log(OIDCClientData)
    //     let clientData = OIDCClientData.from(
    //             "https://oidc.scc.kit.edu/auth/realms/kit/",
    //             "pse-itermori-de",
    //             "http://localhost:3000"
    //     ); 
    //     // let framework = Framework.new(clientData, window.sessionStorage);
    //     // if (params.has("state") && params.has("code")) {
    //     //     framework.authenticate($page.url.href).catch(e => console.log(e.description));
    //     // } else {
    //     //     url = framework.initiate_authentication();
    //     // }
    //     // console.log(Framework);
    // });
</script>