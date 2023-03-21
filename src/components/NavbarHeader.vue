<template>
  <b-navbar
    variant="faded"
    type="dark"
    style="background-color: #343538;"
  >
    <b-navbar-brand
      href="https://www.pointsoftango.com"
      target="_blank"
    >
      <img
        src="@/assets/pots_logo_bar.png"
        alt="Pots Logo"
        height="40"
      >
    </b-navbar-brand>
    <b-collapse
      id="nav-collapse"
      is-nav
    >
      <b-navbar-nav
        align="center"
        style="width: 100%"
      >
        <b-nav-item
          :to="{ name: 'Home' }"
          :active="$route.path === '/' || $route.path === '/events'"
        >
          Events
        </b-nav-item>
        <b-nav-item
          :to="{ name: 'Teachers' }"
          :active="$route.name === 'Teachers'"
        >
          Teachers
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
    <b-navbar-nav class="ml-auto">
      <img
        src="@/assets/UKATA.png"
        alt="UK Tango Association"
        height="40"
      >
    </b-navbar-nav>
  </b-navbar>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');

.nav-item>a {
  font-family: 'Righteous', cursive;
}
</style>
