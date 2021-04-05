<template>
  <v-app dark>
    <v-app-bar fixed app>
      <v-btn icon @click.stop="refresh">
        <v-icon id="refresh-icon">mdi-refresh</v-icon>
      </v-btn>
      <v-spacer />
      <v-toolbar-title>TheMakowskis Solarertrag</v-toolbar-title>
      <v-spacer />
      <v-switch v-model="$vuetify.theme.dark" inset hide-details />
    </v-app-bar>

    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>

    <v-footer app>
      <v-spacer />
      <span> &copy; {{ new Date().getFullYear() }} - Jogius </span>
      <v-spacer />
    </v-footer>
  </v-app>
</template>

<script>
export default {
  mounted() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      // Get data from solar-api
      const fetchedData = await this.$axios.$get(
        'https://solar.themakowskis.de/api/find'
      )
      fetchedData.forEach((data) => {
        data.timestamp += ' UTC'
      })
      this.$store.commit('data/setData', fetchedData)
    },
    refresh() {
      this.fetchData()

      // Trigger rotation animation
      const refreshIcon = document.querySelector('#refresh-icon')
      refreshIcon.classList.remove('spin')
      void refreshIcon.scrollWidth // eslint-disable-line no-void
      refreshIcon.classList.add('spin')
    },
  },
}
</script>

<style scoped>
.spin {
  animation-name: spin;
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-timing-function: ease;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
