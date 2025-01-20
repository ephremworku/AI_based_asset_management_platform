<template>

  <div class="csv-import">
    <h2>Import CSV File</h2>
    <input type="file" @change="handleFileUpload" accept=".csv" />
    <div v-if="csvData.length">
      <h3>CSV Data</h3>
      <button @click="visualizeData">Feature Engineer</button>
      <table v-if="!showGraphs">
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in csvData" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showGraphs">
      <h3>Graphs</h3>
      <!-- Selection Buttons -->
      <div class="selection-container">
        <h4>Select relevant parameters for input</h4>
        <div v-for="(column, index) in numericColumns" :key="index" class="selection-button">
          <input type="checkbox" v-model="column.selected" :id="'col-' + index" />
          <label :for="'col-' + index">{{ column.name }}</label>
        </div>
        <h4>Select Target Parameter</h4>
        <div v-for="(column, index) in numericColumns" :key="'radio-' + index" class="radio-button">
          <input type="radio" v-model="targetParameter" :value="column.name" :id="'radio-' + index" />
          <label :for="'radio-' + index">{{ column.name }}</label>
        </div>
        <button @click="submitSelection">Submit</button>
      </div>
  <div v-for="(column, index) in numericColumns" :key="index" class="graph-row">
  <h4>{{ column.name }}</h4>
  <div class="graph-container">
    <div>
      <h5>Time-Domain</h5>
      <LineChart
        :data="getTimeDomainData(column)"
        :options="chartOptions"
      />
    </div>
    <div>
      <h5>Frequency-Domain</h5>
      <LineChart
        :data="getFrequencyDomainData(column)"
        :options="chartOptions"
      />
    </div>
    <div>
      <h5>Time-Frequency Domain</h5>
      <LineChart
        :data="getTimeFrequencyDomainData(column)"
        :options="chartOptions"
      />
    </div>
  </div>
</div>


    </div>
  </div>
       
</template>

<script>
import { ref, reactive } from 'vue';
import { Line } from 'vue-chartjs';
import { useRoute } from 'vue-router';
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import axios from 'axios';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';
import { data } from 'autoprefixer';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/BaseButton.vue'
import { mdiEye, mdiTrashCan, mdiChartLine, mdiTableBorder, mdiGithub,mdiTable } from '@mdi/js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default {
  components: {
    LineChart: Line
  },

  setup() {
    const csvData = ref([]);
    const headers = ref([]);
    const route = useRoute();
    const assetModel = route.query.assetModel;
    const showGraphs = ref(false);
    const numericColumns = reactive([]);
    const targetParameter = ref(null);
    const chartOptions = reactive({
      responsive: false,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Graph' }
      }
    });
    const router = useRouter();

    function submitSelection() {
    const selectedColumns = numericColumns.filter((column) => column.selected);
    const targetColumn = selectedColumns.find((column) => column.name === targetParameter.value);

    if (!targetColumn) {
        alert("Target parameter must be within selected columns.");
        return;
    }

    const updateFile = {
        data: selectedColumns,      // ✅ Keep this (matches API)
        machine_model: assetModel,  // 🔄 Rename assetModel → machine_model
        target_column: targetColumn.name // 🔄 Rename targetColumn → target_column (use .name)
    };

    console.log("Sending Data:", JSON.stringify(updateFile, null, 2));

    axios
        .post("http://localhost:5000/train_model", updateFile, {
            headers: { "Content-Type": "application/json" }
        })
        .then((result) => {
          if(result.data["message"] == "Model trained and saved successfully"){
            router.push({ path: '/SensorDataView', query: { assetModel: `${assetModel}` } });
            console.log("Asset found in the database")
          }
            console.log("Response:", result.data);

        })
        .catch((error) => {
            console.error("Error:", error.response?.data || error.message);
            alert("Error: " + (error.response?.data?.error || error.message));
        });
}


    function handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === "text/csv") {
        showGraphs.value = false;
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          parseCSV(text);
        };
        reader.readAsText(file);
      } else {
        alert("Please upload a valid CSV file.");
      }
    }

    function parseCSV(csvText) {
      const rows = csvText.split("\n").map((row) => row.split(","));
      headers.value = rows.shift();
      csvData.value = rows.filter((row) => row.length > 1);
      console.log(csvData);
    }

    function visualizeData() {
      numericColumns.length = 0;
      headers.value.forEach((header, index) => {
        const columnValues = csvData.value.map((row) => parseFloat(row[index]));
        if (columnValues.every((val) => !isNaN(val))) {
          numericColumns.push({
            name: header,
            values: columnValues
          });
        }
      });
      showGraphs.value = true;
    }

    function getTimeDomainData(column) {
    return {
      labels: Array.from({ length: Math.min(100, column.values.length) }, (_, i) => i + 1),
      datasets: [
        {
          label: `${column.name} (Time-Domain)`,
          data: column.values.slice(0, 100),
          borderColor: 'blue',
          borderWidth: 2
        }
      ]
    };
    }

    function getFrequencyDomainData(column) {
      const freqData = fftTransform(column.values.slice(0, 100));
      return {
        labels: freqData.frequencies,
        datasets: [
          {
            label: `${column.name} (Frequency-Domain)`,
            data: freqData.amplitudes,
            borderColor: 'green',
            borderWidth: 2
          }
        ]
      };
    }

    function getTimeFrequencyDomainData(column) {
      return {
        labels: Array.from({ length: Math.min(100, column.values.length) }, (_, i) => i + 1),
        datasets: [
          {
            label: `${column.name} (Time-Frequency)`,
            data: column.values.slice(0, 100).map((val) => val * Math.random()), // Placeholder
            borderColor: 'red',
            borderWidth: 2
          }
        ]
      };
    }


    function fftTransform(values) {
      const n = values.length;
      const frequencies = Array.from({ length: n / 2 }, (_, i) => i);
      const amplitudes = frequencies.map(() => Math.random() * 100); // Placeholder
      return { frequencies, amplitudes };
    }

    return {
      csvData,
      headers,
      showGraphs,
      numericColumns,
      submitSelection,
      chartOptions,
      handleFileUpload,
      targetParameter,
      visualizeData,
      getTimeDomainData,
      getFrequencyDomainData,
      getTimeFrequencyDomainData
    };
  }
};
</script>

<style scoped>
.csv-import {
  font-family: Arial, sans-serif;
  margin: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

.graph-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.graph-container {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.selection-container {
  margin-top: 20px;
}

.selection-button {
  display: inline-block;
  margin-right: 10px;
}

button {
  margin-top: 10px;
}
</style>
