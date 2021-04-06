<template>
  <v-container>
    <v-row>
      <canvas id="chart"></canvas>
    </v-row>
    <v-row>
      <v-spacer />
      <v-menu
        ref="startDateMenu"
        v-model="startDateMenu"
        :close-on-content-click="false"
        :return-value="startDate"
        transition="scale-transition"
        offset-overflow
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="startDate"
            label="Anfangsdatum wählen"
            prepend-icon="mdi-calendar-range"
            readonly
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <v-date-picker v-model="startDate" />
      </v-menu>
      <v-spacer />
      <v-menu
        v-model="startTimeMenu"
        :close-on-content-click="false"
        :return-value="startTime"
        transition="scale-transition"
        offset-overflow
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="startTime"
            label="Anfangszeit wählen"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <v-time-picker v-model="startTime" format="24hr" />
      </v-menu>
      <v-spacer />
      <v-menu
        v-model="endTimeMenu"
        :close-on-content-click="false"
        :return-value="endTime"
        transition="scale-transition"
        offset-overflow
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="endTime"
            label="Endzeit wählen"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <v-time-picker v-model="endTime" format="24hr" />
      </v-menu>
      <v-spacer />
      <v-menu
        v-model="endDateMenu"
        :close-on-content-click="false"
        :return-value="endDate"
        transition="scale-transition"
        offset-overflow
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="endDate"
            label="Enddatum wählen"
            prepend-icon="mdi-calendar-range"
            readonly
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <v-date-picker v-model="endDate" />
      </v-menu>
      <v-spacer />
    </v-row>
    <v-row>
      <v-spacer />
      <v-text-field
        v-model="solarYieldSum"
        readonly
        label="Summe des Solarertrages im Zeitraum in Wh"
      />
      <v-spacer />
      <v-spacer />
      <v-text-field
        v-model="flowSpeed"
        type="number"
        label="Pumpgeschwindigkeit im Liter pro Minute"
      />
      <v-spacer />
    </v-row>
  </v-container>
</template>

<script>
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
} from 'chart.js'

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip
)

export default {
  data() {
    return {
      data: [],
      solarYieldSum: 0,
      flowSpeed: 3,
      startDate: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .substring(0, 10),
      startDateMenu: false,
      startTime: new Date().toISOString().substring(11, 16),
      startTimeMenu: false,
      endDate: new Date().toISOString().substring(0, 10),
      endDateMenu: false,
      endTime: new Date().toISOString().substring(11, 16),
      endTimeMenu: false,
      chart: null,
    }
  },
  watch: {
    '$store.state.data.data'() {
      this.refresh()
    },
  },
  mounted() {
    // Get canvas from dom
    this.chart = document.getElementById('chart')

    // Interpret data
    const data = this.getFilteredData(this.$store.state.data.data)
    const labels = this.getLabels(data)

    let tempSolarYieldSum = 0

    // Create chart
    const ctx = document.getElementById('chart').getContext('2d')
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Vorlauftemperatur in °C',
            data: data.map(({ flowtemp }) => flowtemp),
            backgroundColor: '#ff0000',
            borderColor: '#ff0000',
          },
          {
            label: 'Rückflusstemperatur in °C',
            data: data.map(({ refluxtemp }) => refluxtemp),
            backgroundColor: '#00ff00',
            borderColor: '#00ff00',
          },
          {
            label: 'Ertrag in Wh',
            data: data.map(({ solaryield }) => {
              const speed = solaryield * this.flowSpeed
              tempSolarYieldSum += speed
              return speed
            }),
            backgroundColor: '#0000ff',
            borderColor: '#0000ff',
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
    this.solarYieldSum = tempSolarYieldSum
  },
  updated() {
    this.refresh()
  },
  methods: {
    getLabels(data) {
      return data.map(({ timestamp }) => new Date(timestamp).toLocaleString())
    },
    getFilteredData(data) {
      return data.filter(({ timestamp }) => {
        const date = new Date(timestamp)
        return (
          date > new Date(this.startDate + 'T' + this.startTime) &&
          date < new Date(this.endDate + 'T' + this.endTime)
        )
      })
    },
    refresh() {
      const data = this.getFilteredData(this.$store.state.data.data)
      const labels = this.getLabels(data)

      let tempSolarYieldSum = 0

      this.chart.data.labels = labels
      this.chart.data.datasets = [
        {
          label: 'Vorlauftemperatur in °C',
          data: data.map(({ flowtemp }) => flowtemp),
          backgroundColor: '#ff0000',
          borderColor: '#ff0000',
        },
        {
          label: 'Rückflusstemperatur in °C',
          data: data.map(({ refluxtemp }) => refluxtemp),
          backgroundColor: '#00ff00',
          borderColor: '#00ff00',
        },
        {
          label: 'Ertrag in Wh',
          data: data.map(({ solaryield }) => {
            const speed = solaryield * this.flowSpeed
            tempSolarYieldSum += speed
            return speed
          }),
          backgroundColor: '#0000ff',
          borderColor: '#0000ff',
        },
      ]
      this.chart.update()
      this.solarYieldSum = tempSolarYieldSum
    },
  },
}
</script>

<style scoped>
.datepicker {
  margin: 20px;
}
#chart {
  max-height: 70vh;
}
</style>
