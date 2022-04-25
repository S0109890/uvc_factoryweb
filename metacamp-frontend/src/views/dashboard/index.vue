<template>
  <div>
    <h1>대시보드</h1>
    <div>장비: {{ selected.deviceName }}</div>
    <div>태그: {{ selected.tagList }}</div>
    <div v-if="chartData">
      <line-chart :chart-data="chartData" :options="options" ref="chart" style="width: 500px"></line-chart>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt'
import LineChart from '@/components/chart/lineChart'

export default {
  components: {
    'line-chart': LineChart
  },
  data() {
    return {
      selected: {
        // 선택된 장비 정보
        deviceId: 1, // TODO: 현재 화면에서 사용할 장비ID(선택 가능하도록 변경하도록 한다.)
        deviceName: 'Edge1', // TODO: 현재 화면에서 출력할 장비이름(deviceId선택 시 자동 세팅되도록 한다.)
        tagList: ['humidity', 'temperature'] // TODO: 현재 화면에서 출력할 태그 이름(deviceId선택 시 해당 장비의 태그를 설정할 수 있도록 한다.),
        // tagList: ['tag1', 'tag2'] // TODO: 현재 화면에서 출력할 태그 이름(deviceId선택 시 해당 장비의 태그를 설정할 수 있도록 한다.)
      },
      options: {
        responsive: true,
        title: {
          display: true,
          text: '온습도 차트'
        },
        tooltips: {
          mode: 'index'
        },
        hover: {
          mode: 'index'
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Time'
              }
            }
          ],
          yAxes: [
            {
              stacked: false,
              scaleLabel: {
                display: true
              }
            }
          ]
        }
      },
      maxDataLength: 20, // TODO: 현재 차트에서 출력할 데이터의 최대크기(화면에서 입력 가능하도록 한다.)
      mqttDataList: [], // mqtt를 통해 받은 데이터(리스트로 계속 추가됨)
      chartData: null, // 차트로 표현될 데이터
      chartLabels: [], // 차트에서 사용할 라벨 리스트(가로축 라벨)
      chartDatasetLabels: [], // 차트에서 사용할 데이터셋 라벨 리스트
      chartDatasetDataList: [] // 차트에서 사용할 데이터셋 데이터 리스트
    }
  },
  created() {
    this.createMqtt()
  },
  mounted() {
    this.makeChartData()
  },
  methods: {
    createMqtt() {
      // mqtt연결
      const mqttClient = mqtt.connect(process.env.VUE_APP_MQTT)

      mqttClient.on('connect', () => {
        // mqtt연결 시 구독한다.
        const topic = 'metacamp/sensor' // 구독할 topic
        mqttClient.subscribe(topic, {}, (error, res) => {
          if (error) {
            console.error('mqtt client error', error)
          }
        })
      })

      // 메세지 실시간 수신
      mqttClient.on('message', (topic, message) => {
        const mqttData = JSON.parse(message) // json string으로만 받을 수 있음
        // console.log(mqttData.temperature)

        // 선택된 devicdId만 수용함
        this.removeOldData() // 오래된 데이터 제거

        this.mqttDataList.push(mqttData) // 리스트에 계속 추가함

        this.makeChartLabels(mqttData) // 차트라벨 생성
        this.makeChartData() // 차트용 데이터 작성

        // if (this.selected.deviceId === mqttData.id) {
        //   this.removeOldData() // 오래된 데이터 제거

        //   this.mqttDataList.push(mqttData) // 리스트에 계속 추가함

        //   this.makeChartLabels(mqttData) // 차트라벨 생성
        //   this.makeChartData() // 차트용 데이터 작성
        // }
      })
    },
    removeOldData() {
      // 현재 차트에 출력할 수가 x개를 넘어서면 제일 오래된 데이터를 제거 한다.
      if (this.maxDataLength - 1 < this.mqttDataList.length) {
        this.mqttDataList.shift() // mqttData제거
        this.chartLabels.shift() // 차트라벨 제거
      }
    },
    makeChartData() {
      // 차트용 데이터 생성

      // mqtt정보가 없으면 기본 그래프를 그려준다.(이것이 없으면 그래프 자체가 나오지 않음)
      if (this.mqttDataList.length === 0) {
        this.chartData = {
          labels: ['0'],
          datasets: [
            {
              label: 'no data',
              data: [0]
            }
          ]
        }

        return
      }

      // 데이터셋 라벨 리스트 생성(태그 리스트(tagList)를 데이터셋 라벨로 사용한다.)
      const datasetLabels = []
      for (let i = 0; i < this.selected.tagList.length; i += 1) {
        const tagName = this.selected.tagList[i] // tagName을 추출함
        datasetLabels.push(tagName) // tagName을 라벨로 사용함
      }
      this.chartDatasetLabels = Array.from(new Set(datasetLabels)) // 중복 제거

      // 차트 데이터 생성
      this.chartData = {
        labels: this.chartLabels,
        datasets: this.makeDatasetDatas()
      }
      console.log('chartData:', this.chartData)
    },
    makeChartLabels(mqttData) {
      // 차트라벨(가로측) 생성
      this.chartLabels.push(mqttData.datetime.substring(11, 19)) // datetime을 사용한다.(분:초만 추출함)
    },
    makeDatasetDatas() {
      // 데이터셋의 데이터 추출
      const datasetDatas = []

      for (let i = 0; i < this.chartDatasetLabels.length; i += 1) {
        const label = this.chartDatasetLabels[i] // label을 하나씩 추출한다.
        const datas = [] // 해당 label에 속한 데이터셋의 데이터 리스트

        // mqtt로 들어온 데이터에서 key값으로 사용된 tag와 현재 label이 같으면 해당 데이터를 추출 한다.
        for (let j = 0; j < this.mqttDataList.length; j += 1) {
          const mqttData = this.mqttDataList[j]
          console.log(mqttData)
          // console.log(`mqttData[${j}]: ${mqttData}`)
          const tagData = mqttData[label] // 현재 데이터셋 label과 같은 태그만 추출한다.
          datas.push(tagData)
        }
        datasetDatas.push({
          label: label,
          // borderColor: randomColor,
          fill: false,
          data: datas
        })
      }
      return datasetDatas.map((item, idx) => {
        const color = idx === 0 ? '#1B9CFC' : '#e74c3c'
        return { ...item, borderColor: color }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
