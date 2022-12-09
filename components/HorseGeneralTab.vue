<script setup>
    const fields = {
        Phone: "(555) 123-4567",
        Email: "ricardocooper@example.com",
        Title: "Senior Front-End Developer",
        Team: "Product Development",
        Location: "San Francisco",
        Sits: "Oasis, 4th floor",
        Salary: "$145,000",
        Birthday: "June 8, 1990",
    };
</script>

<template>
    <div class="mx-auto my-6 max-w-5xl px-4 sm:px-6 lg:px-8">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div
                v-for="field in Object.keys(fields)"
                :key="field"
                class="sm:col-span-1"
            >
                <dt class="text-sm font-medium text-gray-500">
                    {{ field }}
                </dt>
                <dd class="mt-1 text-sm text-gray-900">
                    {{ fields[field] }}
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
                    <p>
                        Et vivamus lorem pulvinar nascetur non. Pulvinar a sed
                        platea rhoncus ac mauris amet. Urna, sem pretium sit
                        pretium urna, senectus vitae. Scelerisque fermentum,
                        cursus felis dui suspendisse velit pharetra. Augue et
                        duis cursus maecenas eget quam lectus. Accumsan vitae
                        nascetur pharetra rhoncus praesent dictum risus
                        suspendisse.
                    </p>
                </dd>
            </div>
        </dl>
    </div>
</template>
