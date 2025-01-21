<script setup>
import { computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import { mdiEye, mdiTrashCan, mdiChartLine, mdiTableBorder, mdiGithub,mdiTable } from '@mdi/js'

// ✅ Define route before using it in getPropertyData
const route = useRoute();
const router = useRouter();


const mainStore = useMainStore()
const items = computed(() => mainStore.clients)
const getAssetModel = computed(() => `Asset ${route.query.assetModel} Information`)
// ✅ Fix: Use ref to store the asset data from API response
const assetsProperty = ref([])

// ✅ Function to fetch property data
async function getPropertyData() {
    const assetModel = route.query.assetModel;
    const updateFile = {
        asset_model: assetModel
    };

    try {
        const response = await axios.post("http://localhost:5000/sensor_data/asset", updateFile, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("Response:", response.data);

        if (response.data.status === "Asset Not Found" && response.data.length === 0) {
            router.push({ path: '/analysis', query: { assetModel } });
        } else {
            console.log("Asset found in the database");
            assetsProperty.value = response.data; // ✅ Store API data
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        alert("Error: " + (error.response?.data?.error || error.message));
    }
}

// ✅ Fetch data when the component is mounted
getPropertyData();

const isModalActive = ref(false)
const isModalDangerActive = ref(false)
const perPage = ref(10)
const currentPage = ref(0)
const checkedRows = ref([])

// ✅ Fix: assetsProperty is now a ref, so use .value
const itemsPaginated = computed(() => 
    assetsProperty.value.slice(perPage.value * currentPage.value, perPage.value * (currentPage.value + 1))
);

const numPages = computed(() => Math.ceil(assetsProperty.value.length / perPage.value))
const currentPageHuman = computed(() => currentPage.value + 1)

const pagesList = computed(() => {
    return Array.from({ length: numPages.value }, (_, i) => i)
})

const remove = (arr, cb) => arr.filter(item => !cb(item))

const checked = (isChecked, client) => {
    if (isChecked) {
        checkedRows.value.push(client)
    } else {
        checkedRows.value = remove(checkedRows.value, row => row.id === client.id)
    }
}

console.log(itemsPaginated.value)
</script>


<template>
  <SectionTitleLineWithButton :icon="mdiTableBorder" :title="getAssetModel" main>
        <BaseButton
          href="https://github.com/justboil/admin-one-vue-tailwind"
          target="_blank"
          :icon="mdiTable"
          label="Insert Sensor Data"
          color="contrast"
          rounded-full
          small
        />
      </SectionTitleLineWithButton>
      <!-- <p>{{ itemsPaginated[0].targetColumn }}</p> -->

    
      <div class="overflow-x-auto bg-white shadow-md rounded-lg p-4">
        <table class="w-full border-collapse border border-gray-200 rounded-lg">
          <thead class="bg-blue-600 text-white">
            <tr>
              <!-- <th class="px-4 py-3"></th> -->
              <th
                v-for="(key, index) in Object.keys(assetsProperty[0].sensorData || {})"
                :key="index"
                :class="{ 'bg-yellow-500 text-black font-bold': key === itemsPaginated[0].targetColumn }"
                class="px-4 py-3 text-left"
              >
                {{ key }}
              </th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(client, rowIndex) in itemsPaginated"
              :key="rowIndex"
              class="border-b border-gray-200 hover:bg-gray-100 transition"
            >
              <!-- <td class="px-4 py-3 flex justify-center">
                <UserAvatar username="Max" class="w-8 h-8 rounded-full border border-gray-300" />
              </td> -->
              <td
                v-for="(value, key) in client.sensorData"
                :key="key"
                :class="{ 'bg-yellow-100 font-semibold': key === client.targetColumn }"
                class="px-4 py-3 text-gray-700"
              >
                {{ value }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

  <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
    <BaseLevel>
      <BaseButtons>
        <BaseButton
          v-for="page in pagesList"
          :key="page"
          :active="page === currentPage"
          :label="page + 1"
          :color="page === currentPage ? 'lightDark' : 'whiteDark'"
          small
          @click="currentPage = page"
        />
      </BaseButtons>
      <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
    </BaseLevel>
  </div>
</template>

<style scoped>
.target-column {
  /* background-color: #350d0d; */
  /* color: rgb(0, 0, 0); */
  font-weight: bold;
}

.table-container {
  overflow-x: auto;
  margin: 20px;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.styled-table th,
.styled-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.styled-table thead {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

.styled-table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.styled-table tbody tr:hover {
  background-color: #e9ecef;
  transition: 0.3s;
}

/* .target-column {
  background-color: yellow;
  font-weight: bold;
  color: red;
} */

.avatar-cell {
  border: none;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>