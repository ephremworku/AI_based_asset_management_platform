<template>

  <div class="csv-import">
    <!-- <SectionTitleLineWithButton :icon="mdiTableBorder" title="Maintenance History" main>
        <BaseButton
        to="/forms"
          
          :icon="mdiRobot"
          label="Add an Asset"
          color="contrast"
          rounded-full
          small
        />
      </SectionTitleLineWithButton> -->
      <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div class="flex justify-between items-center relative">
  <h2 class="text-2xl font-semibold text-gray-800">Import CSV File</h2>
  <div class="relative group">
  <span class="text-white bg-red-600 px-2 py-1 rounded-full text-xs font-bold cursor-pointer transition-transform transform group-hover:scale-110">
    !
  </span>
  <div class="absolute right-0 mt-2 w-64 bg-gray-800 text-white text-sm p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.
  </div>
</div>
</div>

  
  <label class="block w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
    <span class="text-gray-600">Click to upload CSV</span>
    <input type="file" @change="handleFileUpload" accept=".csv" class="hidden" />
  </label>
  
    <div v-if="csvData.length" class="mt-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-medium text-gray-700">CSV Data View</h3>
        <button @click="visualizeData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Feature Engineer
        </button>
    </div>


    <div class="overflow-x-auto mt-4">
      <table v-if="!showGraphs" class="w-full border-collapse border border-gray-200 shadow-md">
        <thead>
          <tr class="bg-gray-100">
            <th v-for="(header, index) in headers" :key="index" class="px-4 py-2 border border-gray-300 text-left">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in csvData" :key="rowIndex" class="hover:bg-gray-50">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-4 py-2 border border-gray-300">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

    <div v-if="showGraphs">
      <h3 class="text-2xl font-semibold text-gray-800 mb-4">Graphs</h3>


        <div class="bg-white p-6 rounded-lg shadow-lg">
          <h4 class="text-lg font-medium text-gray-700 mb-2">Select relevant parameters for input</h4>
          <div class="flex flex-wrap gap-4">
            <div v-for="(column, index) in numericColumns" :key="index" class="flex items-center gap-2">
              <input type="checkbox" v-model="column.selected" :id="'col-' + index" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label :for="'col-' + index" class="text-gray-700">{{ column.name }}</label>
            </div>
          </div>

          <h4 class="text-lg font-medium text-gray-700 mt-4 mb-2">Select Target Parameter</h4>
          <div class="flex flex-wrap gap-4">
            <div v-for="(column, index) in numericColumns" :key="'radio-' + index" class="flex items-center gap-2">
              <input type="radio" v-model="targetParameter" :value="column.name" :id="'radio-' + index" class="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
              <label :for="'radio-' + index" class="text-gray-700">{{ column.name }}</label>
            </div>
          </div>

          <button @click="submitSelection" class="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" style="width: 3cm;">
            Submit
          </button>
        </div>


        <div v-for="(column, index) in numericColumns" :key="index" class="bg-white p-6 rounded-lg shadow-lg mb-6">
  <h4 class="text-xl font-semibold text-gray-800 mb-4">{{ column.name }}</h4>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="p-4 bg-gray-100 rounded-lg shadow-md">
      <h5 class="text-lg font-medium text-gray-700 mb-2">Time-Domain</h5>
      <LineChart :data="getTimeDomainData(column)" :options="chartOptions" />
    </div>

    <div class="p-4 bg-gray-100 rounded-lg shadow-md">
      <h5 class="text-lg font-medium text-gray-700 mb-2">Frequency-Domain</h5>
      <LineChart :data="getFrequencyDomainData(column)" :options="chartOptions" />
    </div>

    <div class="p-4 bg-gray-100 rounded-lg shadow-md">
      <h5 class="text-lg font-medium text-gray-700 mb-2">Time-Frequency Domain</h5>
      <LineChart :data="getTimeFrequencyDomainData(column)" :options="chartOptions" />
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
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue';

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
    LineChart: Line,
    SectionTitleLineWithButton,
    BaseButton,
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
