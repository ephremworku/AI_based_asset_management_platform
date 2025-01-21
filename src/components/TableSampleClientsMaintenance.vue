<script setup>
import { computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiEye, mdiTrashCan, mdiChartLine } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useRouter } from 'vue-router';
import axios from 'axios';

defineProps({
  checkable: Boolean
})

const mainStore = useMainStore()

const items = computed(() => mainStore.clients)
const assetsProperty = computed(() => mainStore.assets)
console.log(assetsProperty.value)

const isModalActive = ref(false)

const isModalDangerActive = ref(false)

const perPage = ref(5)

const currentPage = ref(0)

const checkedRows = ref([])

const itemsPaginated = computed(() =>
assetsProperty.value.slice(perPage.value * currentPage.value, perPage.value * (currentPage.value + 1))
)

const router = useRouter();

function navigateToAnalysis(assetModel) {
    const updateFile = {
      asset_model: assetModel
    };
  axios
        .post("http://localhost:5000/sensor_data/asset", updateFile, {
            headers: { "Content-Type": "application/json" }
        })
        .then((result) => {
          console.log(result.data)
          if (result.data["status"] == "Asset Not Found") {
            router.push({ path: '/analysis', query: { assetModel: `${assetModel}` } });
          }else{
            console.log("asset found")
            router.push({ path: '/SensorDataView', query: { assetModel: `${assetModel}` } });
            console.log("Asset found in the database")
          }
            console.log("Response:", result.data);
        })
        .catch((error) => {
            console.error("Error:", error.response?.data || error.message);
            alert("Error: " + (error.response?.data?.error || error.message));
        });
  

  ;}
const numPages = computed(() => Math.ceil(assetsProperty.value.length / perPage.value))

const currentPageHuman = computed(() => currentPage.value + 1)

const pagesList = computed(() => {
  const pagesList = []

  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i)
  }

  return pagesList
})

const remove = (arr, cb) => {
  const newArr = []

  arr.forEach((item) => {
    if (!cb(item)) {
      newArr.push(item)
    }
  })

  return newArr
}

const checked = (isChecked, client) => {
  if (isChecked) {
    checkedRows.value.push(client)
  } else {
    checkedRows.value = remove(checkedRows.value, (row) => row.id === client.id)
  }
}
function calculateAssetValue(acquisitionDate, timeInterval, originalValue, depreciationRate) {
    const currentDate = new Date();
    const acquisition = new Date(acquisitionDate);
    
    // Calculate the number of years since the acquisition date
    const yearsElapsed = (currentDate - acquisition) / (1000 * 60 * 60 * 24 * 365);
    
    // Calculate the number of full depreciation periods (timeInterval)
    const periodsElapsed = Math.floor(yearsElapsed / timeInterval);
    
    // Calculate the depreciation amount per period
    const depreciationAmount = originalValue * (depreciationRate / 100) * periodsElapsed;
    
    // Calculate the current value of the asset
    const currentValue = originalValue - depreciationAmount;
    
    // Ensure the current value doesn't go below zero
    return Math.max(currentValue, 0);
}

// console.log(itemsPaginated.value)
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Sample modal">
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <CardBoxModal v-model="isModalDangerActive" title="Please confirm" button="danger" has-cancel>
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <table>
    <thead>
      <tr>
        <th v-if="checkable" />
        <th />
        <th>Asset Model</th>
        <th>originalValue</th>
        <th>acquisitionDate</th>
        <th>nonDepreciableValue</th>
        <th>bookValue</th>
        <th>Analysis</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr v-for="client in itemsPaginated" :key="client.id">
        <TableCheckboxCell v-if="checkable" @checked="checked($event, client)" />
        <td class="border-b-0 lg:w-6 before:hidden">
          <UserAvatar username="Howell Hand" class="w-24 h-24 mx-auto lg:w-6 lg:h-6" />
        </td>
        <td data-label="Asset Model">
          {{ client.assetModel }}
        </td>
        <td data-label="originalValue">
          {{ client.originalValue }}
        </td>
        <td data-label="Aquisition Date">
          {{ client.acquisitionDate }}
          <!-- {{ client.originalValue }} -->
        </td>
        <td data-label="Non Depreciable Value">
          {{ client.nonDepreciableValue }}
          <!-- {{ client.acquisitionDate }} -->
          <!-- {{ client.originalValue }} -->
        </td>
        <td data-label="Book Value" class="lg:w-32">
          {{ calculateAssetValue(client.acquisitionDate, client.depreciationTimeInterval, client.originalValue, client.depreciationRate) }}
          <!-- {{ client.acquisitionDate }} -->
          <!-- {{ client.originalValue }} -->
        </td>
        <!-- <td data-label="bookValue" class="lg:w-32">
          <progress class="flex w-2/5 self-center lg:w-full" max="100" :value="client.bookValue">
            {{ client.bookValue }}
          </progress>
        </td> -->
        <!-- <td data-label="nonDepreciableValue" class="lg:w-1 whitespace-nowrap">
          <small class="text-gray-500 dark:text-slate-400" :title="client.created">{{
            client.nonDepreciableValue
          }}</small>
        </td> -->
        <td class="before:hidden lg:w-1 whitespace-nowrap">
          <BaseButtons type="justify-start lg:justify-end" no-wrap>
            <!-- <BaseButton color="info" :icon="mdiEye" small @click="isModalActive = true" /> -->
            <BaseButton
              color="danger"
              :icon="mdiChartLine"
              small
              @click="navigateToAnalysis(client.assetModel)"
            />
          </BaseButtons>
        </td>
      </tr>
    </tbody>
  </table>
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






<!-- <script setup>
import { computed, ref } from 'vue'
import { useMainStore } from '@/stores/main'
import { mdiEye, mdiTrashCan } from '@mdi/js'
import CardBoxModal from '@/components/CardBoxModal.vue'
import TableCheckboxCell from '@/components/TableCheckboxCell.vue'
import BaseLevel from '@/components/BaseLevel.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import UserAvatar from '@/components/UserAvatar.vue'

defineProps({
  checkable: Boolean
})

const mainStore = useMainStore()

const items = computed(() => mainStore.clients)

const isModalActive = ref(false)

const isModalDangerActive = ref(false)

const perPage = ref(5)

const currentPage = ref(0)

const checkedRows = ref([])

const itemsPaginated = computed(() =>
  items.value.slice(perPage.value * currentPage.value, perPage.value * (currentPage.value + 1))
)

const numPages = computed(() => Math.ceil(items.value.length / perPage.value))

const currentPageHuman = computed(() => currentPage.value + 1)

const pagesList = computed(() => {
  const pagesList = []

  for (let i = 0; i < numPages.value; i++) {
    pagesList.push(i)
  }

  return pagesList
})

const remove = (arr, cb) => {
  const newArr = []

  arr.forEach((item) => {
    if (!cb(item)) {
      newArr.push(item)
    }
  })

  return newArr
}

const checked = (isChecked, client) => {
  if (isChecked) {
    checkedRows.value.push(client)
  } else {
    checkedRows.value = remove(checkedRows.value, (row) => row.id === client.id)
  }
}
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Sample modal">
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <CardBoxModal v-model="isModalDangerActive" title="Please confirm" button="danger" has-cancel>
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <table>
    <thead>
      <tr>
        <th v-if="checkable" />
        <th />
        <th>Name</th>
        <th>Company</th>
        <th>City</th>
        <th>Progress</th>
        <th>Created</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr v-for="client in itemsPaginated" :key="client.id">
        <TableCheckboxCell v-if="checkable" @checked="checked($event, client)" />
        <td class="border-b-0 lg:w-6 before:hidden">
          <UserAvatar :username="client.name" class="w-24 h-24 mx-auto lg:w-6 lg:h-6" />
        </td>
        <td data-label="Name">
          {{ client.name }}
        </td>
        <td data-label="Company">
          {{ client.company }}
        </td>
        <td data-label="City">
          {{ client.city }}
        </td>
        <td data-label="Progress" class="lg:w-32">
          <progress class="flex w-2/5 self-center lg:w-full" max="100" :value="client.progress">
            {{ client.progress }}
          </progress>
        </td>
        <td data-label="Created" class="lg:w-1 whitespace-nowrap">
          <small class="text-gray-500 dark:text-slate-400" :title="client.created">{{
            client.created
          }}</small>
        </td>
        <td class="before:hidden lg:w-1 whitespace-nowrap">
          <BaseButtons type="justify-start lg:justify-end" no-wrap>
            <BaseButton color="info" :icon="mdiEye" small @click="isModalActive = true" />
            <BaseButton
              color="danger"
              :icon="mdiTrashCan"
              small
              @click="isModalDangerActive = true"
            />
          </BaseButtons>
        </td>
      </tr>
    </tbody>
  </table>
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
</template> -->
