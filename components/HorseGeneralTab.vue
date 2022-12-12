<script setup>
    import { DateTime } from "luxon";
    const horse = useState("horse");

    const getAge = (dateString) => {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const fields = ref([
        {
            title: "Last Farrier visit",
            value: "--",
        },
        {
            title: "Last Dentist visit",
            value: "--",
        },
        {
            title: "Last Worming",
            value: "--",
        },
        {
            title: "Last Vaccination",
            value: "-",
        },
        {
            title: "Date of Birth",
            value: "",
        },
    ]);

    watchEffect(() => {
        if (horse.value.dob) {
            fields.value[4].value = DateTime.fromISO(
                String(horse.value.dob)
            ).toLocaleString(DateTime.DATE_MED);
        } else {
            fields.value[4].value = "--";
        }
    });
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
                        {{ horse.about }}
                    </p>
                </dd>
            </div>
        </dl>
    </div>
</template>
