import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { defu } from "defu";
import { useRuntimeConfig, useNuxtApp } from "#imports";
import { browser } from "process";

export const useSupabaseClientPro = <T>(): SupabaseClient<T> => {
    const nuxtApp = useNuxtApp();
    const token = useSupabaseToken();

    const sbToken = useCookie("sb-access-token");

    console.log(sbToken.value);

    const Authorization = token.value ? `bearer ${sbToken.value}` : undefined;

    const {
        supabase: { url, key, client: clientOptions },
    } = useRuntimeConfig().public;

    // Set auth header to make use of RLS
    const options = Authorization
        ? defu(clientOptions, { global: { headers: { Authorization } } })
        : clientOptions;

    // Recreate client if token has changed
    const recreateClient =
        nuxtApp._supabaseClient?.headers.Authorization !== Authorization;

    // No need to recreate client if exists
    if (!nuxtApp._supabaseClient || recreateClient) {
        nuxtApp._supabaseClient = createClient(url, key, options);
    }

    return nuxtApp._supabaseClient;
};
