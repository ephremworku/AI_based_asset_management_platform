import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useMainStore = defineStore('main', () => {
  const userName = ref('John Doe')
  const userEmail = ref('doe.doe.doe@example.com')

  const userAvatar = computed(
    () =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail.value.replace(
        /[^a-z0-9]+/gi,
        '-'
      )}`
  )

  const isFieldFocusRegistered = ref(false)

  const clients = ref([])
  const assets = ref([])
  const history = ref([])

  function setUser(payload) {
    if (payload.name) {
      userName.value = payload.name
    }
    if (payload.email) {
      userEmail.value = payload.email
    }
  }

  function fetchSampleClients() {
    axios
      .get(`data-sources/clients.json?v=3`)
      .then((result) => {
        clients.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchSampleHistory() {
    axios
      .get(`data-sources/history.json`)
      .then((result) => {
        history.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchAssetsProperty() {
    axios
      .get(`http://localhost:5000/get_assets`)
      .then((result) => {
        // console.log(`the new data from the api ${result.data}`)
        console.log(result.data)
        assets.value = result.data
      })
      .catch((error) => {
        alert(error.message)
      })
    // axios
    //   .get(`data-sources/assetProperty.json?v=2`)
    //   .then((result) => {
    //     console.log(result?.data?.data)
    //     assets.value = result?.data?.data
    //   })
    //   .catch((error) => {
    //     alert(error.message)
    //   })
    }

  return {
    userName,
    userEmail,
    userAvatar,
    isFieldFocusRegistered,
    clients,
    history,
    assets,
    setUser,
    fetchSampleClients,
    fetchSampleHistory,
    fetchAssetsProperty
  }
})
