<template>
  <div class="card-container">
    <div
      class='banner-img'
      :style="`background-image: url(${coverImageUrl || 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'})`"></div>
    <img v-if="avatarImageUrl" :src="avatarImageUrl" alt='Profile Image' class="profile-img">
    <img v-else src="https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" alt="" class="profile-img">
    <div class="card-content">
      <h1
        :style="{'color': textColor}" class="name">{{ name }}</h1>
      <p v-for="(location, index) in locations" :key="index"
        :style="{'color': textColor}"
        class="description">
        <font-awesome-icon icon="fa-solid fa-location-dot" /> {{ location.city }}<span v-if="location.postcode"> - {{ location.postcode }}</span>
      </p>
      <p v-if="clubName" :style="{'color': textColor}"
        class="club">
        Club: {{ clubName }}
      </p>
    </div>
    <footer class="card-footer">
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
    </footer>
  </div>
</template>

<script>
export default {
  props: {
    avatarImageUrl: String,
    name: String,
    description: String,
    coverImageUrl: String,
    locations: Array,
    contact: Object,
    clubName: String,
    textColor: { type: String, default: 'black' }
  },
  data () {
    return {}
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
  box-shadow: 0 2px 10px rgba(25, 25, 25, 0.12);
  border: 1px solid #E8E6E6;
  text-align: center;
  border-radius: 1rem;
  position: relative;
  width: 280px;
  padding-bottom: 1rem;
  background: #fff;
}

.card-container:hover {
  box-shadow: 0 8px 24px rgba(27, 130, 197, 0.18);
}

.banner-img {
  position: absolute;
  height: 10rem;
  width: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 0;
  background-color: #1B82C5;
}

.profile-img {
  width: 8rem;
  margin-top: 6.5rem;
  box-shadow: 0px 2px 8px 0px #333333;
  border: 2px solid #FBC020;
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

.club {
  margin: .5rem 1rem;
  font-size: 0.9rem;
}

.text-line {
  margin: .5rem .2rem;
}

.card-footer a {
  color: #1B82C5;
}

.card-footer {
  padding: 0.75rem 1.25rem;
  background-color: #F0F7F9;
  border-top: 1px solid #E8E6E6;
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 3rem;
}

.card-content {
  margin-bottom: 3rem;
}

</style>
