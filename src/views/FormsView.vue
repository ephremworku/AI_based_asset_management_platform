<script setup>
import { reactive, ref } from 'vue'
import { mdiBallotOutline, mdiAccount, mdiMail, mdiGithub } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import FormCheckRadioGroup from '@/components/FormCheckRadioGroup.vue'
import FormFilePicker from '@/components/FormFilePicker.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import BaseDivider from '@/components/BaseDivider.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import NotificationBarInCard from '@/components/NotificationBarInCard.vue'
import axios from 'axios'
import { useRouter } from 'vue-router';
const router = useRouter();


const selectOptions = [
  { id: 1, label: 'Business development' },
  { id: 2, label: 'Marketing' },
  { id: 3, label: 'Sales' }
]

const form = reactive({
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '',
  department: selectOptions[0],
  subject: '',
  question: ''
})
const assetForm = reactive({
  assetModel: 'Model Name',
  originalValue: 0,
  acquisitionDate: '0000-00-00',
  nonDepreciableValue: 0,
  bookValue: 0
})

const customElementsForm = reactive({
  checkbox: ['lorem'],
  radio: 'one',
  switch: ['one'],
  file: null
})

// const submit = () => {
//   console.log('submit pressed')
//   //
// }


const submit = () => {

  const updateFile = {
    asset_model: assetForm.assetModel,
    original_value: assetForm.originalValue,
    acquisition_date: assetForm.acquisitionDate,
    non_depreciable_value: assetForm.nonDepreciableValue,
    book_value: assetForm.bookValue,
    };

    console.log("Sending Data:", JSON.stringify(updateFile, null, 2));

    axios
        .post("http://localhost:5000/add_assets", updateFile, {
            headers: { "Content-Type": "application/json" }
        })
        .then((result) => {
          router.push({ path: '/tables'});
            console.log("Response:", result.data);
        })
        .catch((error) => {
            console.error("Error:", error.response?.data || error.message);
            alert("Error: " + (error.response?.data?.error || error.message));
        });
  // axios
  //   .post(`http://localhost:3000/data/`, {
  //     assetModel: assetForm.assetModel,
  //     originalValue: assetForm.originalValue,
  //     acquisitionDate: assetForm.acquisitionDate,
  //     nonDepreciableValue: assetForm.nonDepreciableValue,
  //     bookValue: assetForm.bookValue,
  //   })
  //   .then((response) => {
  //     console.log('Data successfully updated:', response.data);
  //     alert('Asset data updated successfully!');
  //   })
  //   .catch((error) => {
  //     console.error('Error updating data:', error);
  //     alert('Failed to update asset data: ' + error.message);
  //   });
};

const formStatusWithHeader = ref(true)

const formStatusCurrent = ref(0)

const formStatusOptions = ['info', 'success', 'danger', 'warning']

const formStatusSubmit = () => {
  formStatusCurrent.value = formStatusOptions[formStatusCurrent.value + 1]
    ? formStatusCurrent.value + 1
    : 0
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiBallotOutline" title="Insert Asset Information" main>
        <!-- <BaseButton
          href="https://github.com/justboil/admin-one-vue-tailwind"
          target="_blank"
          :icon="mdiGithub"
          label="Add Asset"
          color="contrast"
          rounded-full
          small
        /> -->
      </SectionTitleLineWithButton>
      <CardBox form @submit.prevent="submit">
        <FormField label="Asset Model Information">
          <FormControl v-model="assetForm.assetModel" :icon="mdiAccount" />
        </FormField>
        <FormField label="Acquisition Date">
          <FormControl v-model="assetForm.acquisitionDate" type="date" :icon="mdiMail" />
        </FormField>

        <FormField label="Original Value" help="Enter different than zero">
          <FormControl v-model="assetForm.originalValue" type="number" placeholder="Asset Original Value" />
        </FormField>
        <FormField label="Asset Book Value" help="Enter current asset value">
          <FormControl v-model="assetForm.bookValue" type="number" placeholder="Asset Book Value" />
        </FormField>

        <!-- <FormField label="Dropdown">
          <FormControl v-model="form.department" :options="selectOptions" />
        </FormField> -->

        <BaseDivider />

        <!-- <FormField label="Question" help="Your question. Max 255 characters">
          <FormControl type="textarea" placeholder="Explain how we can help you" />
        </FormField> -->

        <template #footer>
          <BaseButtons>
            <button  @click="submit"  type="submit">Submit</button>
            <BaseButton type="submit" color="info" label="Submit" />
            <BaseButton type="reset" color="info" outline label="Reset" />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionMain>

    <!-- <SectionTitle>Custom elements</SectionTitle>

    <SectionMain>
      <CardBox>
        <FormField label="Checkbox">
          <FormCheckRadioGroup
            v-model="customElementsForm.checkbox"
            name="sample-checkbox"
            :options="{ lorem: 'Lorem', ipsum: 'Ipsum', dolore: 'Dolore' }"
          />
        </FormField>

        <BaseDivider />

        <FormField label="Radio">
          <FormCheckRadioGroup
            v-model="customElementsForm.radio"
            name="sample-radio"
            type="radio"
            :options="{ one: 'One', two: 'Two' }"
          />
        </FormField>

        <BaseDivider />

        <FormField label="Switch">
          <FormCheckRadioGroup
            v-model="customElementsForm.switch"
            name="sample-switch"
            type="switch"
            :options="{ one: 'One', two: 'Two' }"
          />
        </FormField>

        <BaseDivider />

        <FormFilePicker v-model="customElementsForm.file" label="Upload" />
      </CardBox>

      <SectionTitle>Form with status example</SectionTitle>

      <CardBox
        class="md:w-7/12 lg:w-5/12 xl:w-4/12 shadow-2xl md:mx-auto"
        is-form
        is-hoverable
        @submit.prevent="formStatusSubmit"
      >
        <NotificationBarInCard
          :color="formStatusOptions[formStatusCurrent]"
          :is-placed-with-header="formStatusWithHeader"
        >
          <span
            ><b class="capitalize">{{ formStatusOptions[formStatusCurrent] }}</b> state</span
          >
        </NotificationBarInCard>
        <FormField label="Fields">
          <FormControl
            v-model="form.name"
            :icon-left="mdiAccount"
            help="Your full name"
            placeholder="Name"
          />
        </FormField>

        <template #footer>
          <BaseButton label="Trigger" type="submit" color="info" />
        </template>
      </CardBox>
    </SectionMain> -->
  </LayoutAuthenticated>
</template>
