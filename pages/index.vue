<script setup>
    import MyComponent from "~~/components/MyComponent.vue";

    // get request
    const { data } = await useFetch("/api/horse");

    // get request with param
    //const { data } = await useFetch("/api/horse?name=poppy");

    // post request
    // const { data2 } = await useFetch("/api/horse", {
    //     method: "post",
    //     body: { name: poppy, age: 25 },
    // });
</script>

<template>
    <div>
        <h2>Homepage</h2>
        <MyComponent :first-name="'Keone'" />

        <div>{{ data }}</div>
    </div>
</template>
