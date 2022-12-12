<script setup>
    const fields = [
        {
            title: "Last Farrier visit",
            value: "2 Weeks ago",
        },
        {
            title: "Last Dentist visit",
            value: "4 Weeks ago",
        },
        {
            title: "Last Worming",
            value: "--",
        },
        {
            title: "Last Vaccination",
            value: "4 Weeks ago",
        },
        {
            title: "Date of Birth",
            value: "1st October 1997 (25 years old)",
        },
    ];
</script>

<template>
    <div class="mx-auto my-6 max-w-5xl px-4 sm:px-6 lg:px-8">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div
                v-for="field in fields"
                :key="field.title"
                class="sm:col-span-1"
            >
                <dt class="text-sm font-medium text-gray-500">
                    {{ field.title }}
                </dt>
                <dd class="mt-1 text-sm text-gray-900">
                    {{ field.value }}
                </dd>
            </div>

            <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">About</dt>
                <dd class="mt-1 max-w-prose space-y-5 text-sm text-gray-900">
                    <p>
                        Tincidunt quam neque in cursus viverra orci, dapibus nec
                        tristique. Nullam ut sit dolor consectetur urna, dui
                        cras nec sed. Cursus risus congue arcu aenean posuere
                        aliquam.
                    </p>
                </dd>
            </div>
        </dl>
    </div>
</template>
