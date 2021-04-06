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
      // fetchedData = fetchedData.filter(({ id }) => id % 5 === 0)
      fetchedData.forEach((data) => {
        data.status = data.status > 0 ? 1 : 0
        data.timestamp += ' UTC'
        data.solaryield =
          -0.00064 +
          (1.03392 +
            0.00055 * (data.refluxtemp - 20) +
            0.000002 * Math.pow(data.refluxtemp - 20, 2)) +
          0.00057 * Math.pow(data.flowtemp - data.refluxtemp, 2)
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
