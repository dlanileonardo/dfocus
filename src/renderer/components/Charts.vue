<template>
  <sui-container id="chart">
    <sui-segment basic>
      <sui-grid centered>
        <sui-grid-column :width="16">
          <sui-menu inverted pointing secondary>
            <!-- <a
              is="sui-menu-item"
              v-for="item in submenu_group"
              :active="isActiveGroup(item)"
              :key="item.key"
              :content="item.name"
              @click="selectGroup(item)"
            /> -->

            <sui-menu-menu position="right">
              <a
                is="sui-menu-item"
                :active="isActiveView('absolute')"
                :content="$t('Absolute')"
                @click="selectView('absolute')"
              />
              <a
                is="sui-menu-item"
                :active="isActiveView('percentage')"
                :content="$t('Percentage')"
                @click="selectView('percentage')"
              />
            </sui-menu-menu>
          </sui-menu>
        </sui-grid-column>
      </sui-grid>
    </sui-segment>

    <sui-grid>
        <sui-grid-column :width="16">
          <sui-segment inverted>
            <apexchart ref="chart" type="bar" :options="chartOptions" :series="series"></apexchart>
          </sui-segment>
        </sui-grid-column>
    </sui-grid>
  </sui-container>
</template>
<script>
export default {
  mounted () {
    this.reloadChart()
  },
  methods: {
    isActiveGroup (active) {
      return this.group_active.key === active.key
    },
    selectGroup (name) {
      this.group_active = name
      this.reloadChart()
    },
    isActiveView (active) {
      return this.view_type === active
    },
    selectView (type) {
      this.view_type = type
      this.reloadChart()
    },
    getDaysArray (year, month) {
      let days = this.$moment().format('DD')
      var daysInMonth = this.$moment().format('DD')
      var arrDays = []

      while ((days - daysInMonth) < 7) {
        var current = this.$moment().date(daysInMonth)
        arrDays.push(current)
        daysInMonth--
      }

      return arrDays.reverse()
    },
    reloadChart  () {
      let that = this

      // console.log(this.$moment.weekdays(), this.getDaysArray(2018, 3))
      let moment = that.$moment()
      this.chartOptions.xaxis.categories = this.getDaysArray(moment.year(), moment.month()).map((item) => {
        return item.format('DD MMM YY')
      })

      that.settings.sufixo = that.view_type === 'percentage' ? '%' : that.settings.fixed_sufixo
      let newChartOptions = {
        chart: {
          stackType: that.view_type === 'percentage' ? '100%' : 'normal'
        },
        yaxis: {
          max: that.view_type === 'percentage' ? 100 : null
        }
      }

      this.$db.pomodoros.find({ }, (err, docs) => {
        if (err) { console.error(err) }
        let grouped = that.lodash.groupBy(docs, (item) => {
          return that.$moment(item.updatedAt).format('DD MMM YY')
        })

        let allSeries = that.lodash.map(this.chartOptions.xaxis.categories, (item, key) => {
          let group = grouped[item] ? grouped[item] : []

          let breaks = that.lodash.filter(group, { type: 'break' })
          let pomodoros = that.lodash.filter(group, { type: 'pomodoro' })

          let sumedPomodors = that.lodash.sumBy(pomodoros, 'elapsed')
          let sumedBreaks = that.lodash.sumBy(breaks, 'elapsed')

          return {
            category: item,
            sumed_pomodors: sumedPomodors / 60,
            sumed_breaks: sumedBreaks / 60
          }
        })

        let series = {
          focus: [],
          breaks: []
        }
        that.lodash.forEach(allSeries, (item) => {
          series.focus.push({
            x: item.category,
            y: item.sumed_pomodors ? item.sumed_pomodors : 0
          })
          series.breaks.push({
            x: item.category,
            y: item.sumed_breaks ? item.sumed_breaks : 0
          })
        })

        that.$refs.chart.updateOptions(newChartOptions)

        that.series = [
          {
            name: this.$t('Focus'),
            data: series.focus
          },
          {
            name: this.$t('Breaks'),
            data: series.breaks
          }
        ]
      })
    }
  },
  data: function () {
    let that = this
    return {
      settings: {
        fixed_sufixo: ' m',
        sufixo: ' m',
        format: 'mm'
      },
      submenu_group: [
        { name: this.$t('Minutes'), key: 'minutes' },
        { name: this.$t('Hours'), key: 'hours' }
      ],
      group_active: { key: 'minutes' },
      view_type: 'absolute',

      chartOptions: {
        fill: {
          colors: ['#2185D0', '#21BA45'],
          opacity: 0.9,
          type: 'solid'
        },
        tooltip: {
          theme: 'dark',
          enabled: true,
          shared: true,
          inverseOrder: true,
          fillSeriesColor: true,
          y: {
            formatter: function (value, opts) {
              return [value.toFixed(1) + that.settings.fixed_sufixo]
            }
          }
        },
        dataLabels: {
          enabled: true,
          textAnchor: 'middle',
          offsetY: 6,
          formatter: function (val, opt) {
            return val > 0 ? val.toFixed(1) + that.settings.sufixo : ''
          }
        },
        yaxis: {
          max: 100,
          axisTicks: {
            show: false
          },
          crosshairs: {
            position: 'front',
            show: true
          },
          labels: {
            formatter: function (value) {
              return value.toFixed(1) + that.settings.sufixo
            }
          }
        },
        legend: {
          offsetY: -5
        },
        chart: {
          animations: {
            enabled: true
          },
          id: 'vuechart',
          height: 300,
          stacked: true,
          stackType: 'normal',
          toolbar: { show: false },
          dropShadow: {
            enabled: true,
            top: 2,
            left: 2,
            blur: 2,
            opacity: 0.5
          }
        },
        grid: {
          show: false
        },
        xaxis: {
          categories: [],
          position: 'bottom',
          labels: {
            offsetY: -5
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: true
          }
        }
      },
      series: [
        {
          name: 'Focus',
          data: []
        },
        {
          name: 'Breaks',
          data: []
        }
      ]
    }
  }
}
</script>
<style>
.apexcharts-tooltip {
    color: black !important;
}

.apexcharts-tooltip .apexcharts-tooltip-title {
    color: white !important;
}
</style>
