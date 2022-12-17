<script setup>
    import { DateTime } from "luxon";
    const horse = useState("horse");

    // const getAge = (dateString) => {
    //     var today = new Date();
    //     var birthDate = new Date(dateString);
    //     var age = today.getFullYear() - birthDate.getFullYear();
    //     var m = today.getMonth() - birthDate.getMonth();
    //     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    //         age--;
    //     }
    //     return age;
    // };
</script>

<template>
    <div class="mx-auto my-6 max-w-5xl px-4 sm:px-6 lg:px-8">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <!-- Farrier -->
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">
                    Last Farrier Visit
                </dt>
                <dd class="mt-1 text-sm text-gray-900">--</dd>
            </div>
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">
                    Next Farrier Visit
                </dt>
                <dd class="mt-1 text-sm text-gray-900">--</dd>
            </div>

            <!-- Dentist -->
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">
                    Last Dentist Visit
                </dt>
                <dd class="mt-1 text-sm text-gray-900">--</dd>
            </div>
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">
                    Next Dentist Visit
                </dt>
                <dd class="mt-1 text-sm text-gray-900">--</dd>
            </div>

            <!-- Worming -->
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Last Worming</dt>
                <dd class="mt-1 text-sm text-gray-900">--</dd>
            </div>
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Next Worming</dt>
                <dd class="mt-1 text-sm text-gray-900">--</dd>
            </div>

            <!-- Vaccinations -->
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">
                    Last Vaccinations
                </dt>
                <dd class="mt-1 text-sm text-gray-900">--</dd>
            </div>
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">
                    Next Vaccinations
                </dt>
                <dd class="mt-1 text-sm text-gray-900">--</dd>
            </div>

            <!-- Breed -->
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">
                    <span v-if="horse.breed">{{ horse.breed }}</span>
                    <span v-else>--</span>
                </dd>
            </div>

            <!-- Color & Markings -->
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">
                    <span v-if="horse.color_markings">{{
                        horse.color_markings
                    }}</span>
                    <span v-else>--</span>
                </dd>
            </div>

            <!-- DoB -->
            <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">
                    <span v-if="horse.dob">{{
                        DateTime.fromISO(String(horse.dob)).toLocaleString(
                            DateTime.DATE_MED
                        )
                    }}</span>
                    <span v-else>--</span>
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
