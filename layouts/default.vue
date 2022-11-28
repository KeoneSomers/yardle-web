<template>
    <div>
        <header>
            <nav class="shadow bg-blue-500 p-4 mr-2 flex">
                <ul>
                    <li>
                        <NuxtLink to="/">Home</NuxtLink>
                        <NuxtLink to="/about">About</NuxtLink>
                        <NuxtLink to="/yards">Yards</NuxtLink>
                        <NuxtLink to="/login">Login</NuxtLink>
                    </li>
                </ul>
            </nav>
        </header>
        <div>
            <slot />
        </div>
    </div>
</template>

<style scoped>
    .router-link-exact-active {
        color: blue;
    }
</style>
