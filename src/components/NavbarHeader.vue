<template>
    <b-navbar variant="faded" type="light">
        <b-navbar-brand href="https://argentinetango.co.uk">
            <img src="@/assets/UKATA.png" alt="UK Tango Association" height="90" width="117"
                style="object-fit: contain;margin-left: 130px;" />
        </b-navbar-brand>
        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav align="center" style="width: 100%">
                <b-nav-item href="https://www.argentinetango.co.uk/" target="_blank" :active="$route.path === '/'">
                    Home
                </b-nav-item>
                <b-nav-item :to="{ name: 'Home' }" :active="$route.path === '/events'">
                    Events
                </b-nav-item>
                <b-nav-item :to="{ name: 'Teachers' }" :active="$route.name === 'Teachers'">
                    Teachers
                </b-nav-item>
            </b-navbar-nav>
        </b-collapse>
        <b-navbar-brand href="https://www.pointsoftango.com" target="_blank">
            <img src="@/assets/pots_logo_bar.png" alt="Pots Logo" height="70" width="100"
                style="height: 55px;margin-right: 130px;"/>
        </b-navbar-brand>
    </b-navbar>
</template>

<!-- <style scoped>
    @import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');

    .nav-item>a {
        font-family: 'Righteous', cursive;
    }
</style> -->
