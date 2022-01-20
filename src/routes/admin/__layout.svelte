<script lang=ts>
    import { OidcContext } from '@dopry/svelte-oidc';
</script>

<style lang=scss>

</style>

<OidcContext
    issuer="https://oidc.scc.kit.edu/auth/realms/kit"
    client_id="pse-itermori-de"
    redirect_uri={window.location.href}
    post_logout_redirect_uri={window.location.href}
    extraOptions={{
        mergeClaims: true,
        automaticSilentRenew: true
    }}
>
<slot />

</OidcContext>
