<script setup>
    const client = useSupabaseClient();

    // since I just need the uid I can use this even though it's not in state
    const user = useState("user");

    const members = useState("members");

    await useAsyncData("members", async () => {
        const { data, error } = await client
            .from("yards")
            .select("profiles!profiles_yards(*)")
            .eq("id", user.value.user_metadata.selected_yard)
            .single();

        members.value = data.profiles;
    });
</script>

<template>
    <div>
        <p>Memebers Page</p>
        <CodeBlock>
            {{ members }}
        </CodeBlock>
    </div>
</template>
