<script setup>
    const locations = [
        {
            name: "Poppy",
            people: [
                {
                    name: "Lindsay Walton",
                    title: "Front-end Developer",
                },
                {
                    name: "Courtney Henry",
                    title: "Designer",
                },
            ],
        },
        {
            name: "Annie",
            people: [
                {
                    name: "Lindsay Walton",
                    title: "Front-end Developer",
                },
                {
                    name: "Courtney Henry",
                    title: "Designer",
                },
            ],
        },
        {
            name: "Zeus",
            people: [
                {
                    name: "Lindsay Walton",
                    title: "Front-end Developer",
                },
                {
                    name: "Courtney Henry",
                    title: "Designer",
                },
            ],
        },
        {
            name: "Cloud",
            people: [
                {
                    name: "Lindsay Walton",
                    title: "Front-end Developer",
                },
                {
                    name: "Courtney Henry",
                    title: "Designer",
                },
            ],
        },
    ];
</script>

<template>
    <div class="px-4 sm:px-6 lg:px-8 py-10">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Rug Report</h1>
                <p class="mt-2 text-sm text-gray-700">
                    A combined list of all the rugs in this yard and the horse
                    they belong to.
                </p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                >
                    Print
                </button>
            </div>
        </div>
        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div
                    class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8"
                >
                    <div
                        class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
                    >
                        <table class="min-w-full">
                            <thead class="bg-white">
                                <tr>
                                    <th
                                        scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        Type
                                    </th>
                                    <th
                                        scope="col"
                                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white">
                                <template
                                    v-for="location in locations"
                                    :key="location.name"
                                >
                                    <tr class="border-t border-gray-200">
                                        <th
                                            colspan="5"
                                            scope="colgroup"
                                            class="bg-gray-50 px-4 py-2 text-left text-sm font-semibold text-gray-900 sm:px-6"
                                        >
                                            {{ location.name }}
                                        </th>
                                    </tr>
                                    <tr
                                        v-for="(
                                            person, personIdx
                                        ) in location.people"
                                        :key="person.email"
                                        :class="[
                                            personIdx === 0
                                                ? 'border-gray-300'
                                                : 'border-gray-200',
                                            'border-t',
                                        ]"
                                    >
                                        <td
                                            class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                                        >
                                            {{ person.name }}
                                        </td>
                                        <td
                                            class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                                        >
                                            {{ person.title }}
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
