<template>
    <div>
        <header>
            <nav>
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
            <p>Your Logged out and this is the logged out layout!!</p>
        </div>
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
