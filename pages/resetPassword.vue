<script setup>
    definePageMeta({
        layout: "blank",
    });

    const user = useSupabaseUser();
</script>

<template>
    <div>
        <p>reset password</p>
        <CodeBlock>{{ user }}</CodeBlock>
    </div>
</template>
