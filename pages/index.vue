<script setup>
    const user = useSupabaseUser();
    // get request
    // const { data } = await useFetch("/api/horse");

    // get request with param
    //const { data } = await useFetch("/api/horse?name=poppy");

    // post request
    // const { data2 } = await useFetch("/api/horse", {
    //     method: "post",
    //     body: { name: poppy, age: 25 },
    // });

    // TODO: set from pinia store
    const selectedYard = ref(null);
</script>

<template>
    <div>
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div class="py-4">
            <!-- <MyComponent first-name="Keone" /> -->
            <div v-if="selectedYard">
                Selected Yard is: {{ selectedYard.id }}
            </div>
            <div v-else>
                You have not selected a yard. Showing Yards List and button for
                create yard.
            </div>
        </div>
    </div>
</template>
