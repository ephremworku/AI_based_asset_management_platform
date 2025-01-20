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
  <SectionTitleLineWithButton :icon="mdiTableBorder" title="Sensor Data" main>
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

    
  <div class="table-container">
    <table class="styled-table">
      <thead>
        <tr>
          <th />
          <th
            v-for="(key, index) in Object.keys(assetsProperty[0].sensorData || {})"
            :key="index"
            :class="{ 'target-column': key === itemsPaginated[0].targetColumn }"
          >
            {{ key }}
          </th>
          <th />
        </tr>
      </thead>

      <tbody>
        <tr v-for="(client, rowIndex) in itemsPaginated" :key="rowIndex">
          <td class="avatar-cell">
            <UserAvatar username="User" class="avatar" />
          </td>

          <td
            v-for="(value, key) in client.sensorData"
            :key="key"
            :data-label="key"
            :class="{ 'target-column': key === client.targetColumn }"
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