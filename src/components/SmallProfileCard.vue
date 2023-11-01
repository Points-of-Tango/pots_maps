<template>
  <div class="card-container">
    <div
      class='banner-img'
      :style="`background-image: url(${coverImageUrl || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'})`"></div>
    <img v-if="avatarImageUrl" :src="avatarImageUrl" alt='Profile Image' class="profile-img">
    <img v-else src="https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" alt="" class="profile-img">
    <h1 v-if="profileId"
      :style="{'color': textColor}" class="name cursor-pointer"
      @click="clickHandler">{{ name }}</h1>
    <h1 v-else
      :style="{'color': textColor}" class="name">{{ name }}</h1>
    <p v-for="(location, index) in locations" :key="index"
      :style="{'color': textColor}"
      class="description">
      <font-awesome-icon icon="fa-solid fa-location-dot" /> {{ location.city }}<span v-if="location.postcode"> - {{ location.postcode }}</span>
    </p>
    <span v-if="webpagelink" :style="{'color': textColor}" class="text-line">
      <a :href="webpagelink" target="blank">
        <font-awesome-icon icon="fa-solid fa-globe" />
      </a>
    </span>
    <span v-if="contact && contact.email" :style="{'color': textColor}" class="text-line">
      <a :href="`mailto:${contact.email}`">
        <font-awesome-icon icon="fa-solid fa-envelope" />
      </a>
    </span>
    <span v-if="contact && contact.facebook" :style="{'color': textColor}" class="text-line">
      <a :href="`https://facebook.com/${contact.facebook}`">
        <font-awesome-icon icon="fab fa-facebook" />
      </a>
    </span>
    <span v-if="contact && contact.instagram" :style="{'color': textColor}" class="text-line">
      <a :href="`https://instagram.com/${contact.instagram}`">
        <font-awesome-icon icon="fab fa-instagram" />
      </a>
    </span>
    <button v-if="showFollowButton" class='btn'>Follow</button>
  </div>
</template>

<script>
export default {
  props: {
    profileId: String,
    avatarImageUrl: String,
    name: String,
    description: String,
    showFollowButton: Boolean,
    coverImageUrl: String,
    locations: Array,
    contact: Object,
    textColor: { type: String, default: 'black' }
  },
  data () {
    return {}
  },
  methods: {
    clickHandler: () => {
      this.$router.push(`/profile/${this.profileId.value}`)
    }
  },
  computed: {
    webpagelink: function () {
      if (this.contact && this.contact.link) {
        if (this.contact.link.startsWith('http://') || this.contact.link.startsWith('https://')) {
          return this.contact.link
        } else {
          return 'https://' + this.contact.link
        }
      } else {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.card-container {
  overflow: hidden;
  box-shadow: 0px 2px 8px 0px #333333;
  text-align: center;
  border-radius: 1rem;
  position: relative;
  width: 280px;
  padding-bottom: 1rem;
}

.banner-img {
  position: absolute;
  height: 10rem;
  width: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 0;
  background-color: #660404;
}

.profile-img {
  width: 8rem;
  margin-top: 6.5rem;
  box-shadow: 0px 2px 8px 0px #333333;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  object-fit: cover;
  z-index: 1;
  position: relative;
}

.name {
  font-weight: bold;
  font-size: 1.5rem;
  width: 100%;
  padding: .5rem;
}

.cursor-pointer {
  cursor: pointer;
}

.description {
  margin: .5rem 1rem;
  font-size: 0.9rem;
}

.text-line {
  margin: .5rem .2rem;
}

.btn {
  width: 100%;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  padding: 1rem;
  background-color: #46b5aa;
}

</style>
