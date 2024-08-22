<template>
  <FormContainer :show-header="false" class="justify-content items-center h-full"
    :class="{ 'window-drag': platform !== 'Windows' }">
    <template #body>
      <FormHeader :form-title="t`Set up your organization`" class="sticky top-0 bg-white border-b">
      </FormHeader>

      <!-- Section Container -->
      <div v-if="hasDoc" class="overflow-auto custom-scroll">
        <CommonFormSection v-for="([name, fields], idx) in activeGroup.entries()" :key="name + idx" ref="section"
          class="p-4" :class="idx !== 0 && activeGroup.size > 1 ? 'border-t' : ''"
          :show-title="activeGroup.size > 1 && name !== t`Default`" :title="name" :fields="fields" :doc="doc"
          :errors="errors" :collapsible="false" @value-change="onValueChange" />
      </div>

      <!-- Buttons Bar -->
      <div class="mt-auto p-4 flex items-center justify-between border-t flex-shrink-0 sticky bottom-0 bg-white">
        <p v-if="loading" class="text-base text-gray-600">
          {{ t`Loading instance...` }}
        </p>
        <Button v-if="!loading" class="w-24" @click="cancel">{{
          t`Cancel`
        }}</Button>
        <Button v-if="fyo.store.isDevelopment && !loading" class="w-24 ml-auto mr-4" :disabled="loading" @click="fill">{{
          t`Fill` }}</Button>
        <Button type="primary" class="w-24" data-testid="submit-button"
          :disabled="!areAllValuesFilled || loading || isLoading" @click="submit">{{ isLoading ? "Loading..." : t`Submit`
          }}</Button>
      </div>
    </template>
  </FormContainer>
</template>
<script lang="ts">
import { DocValue } from 'fyo/core/types';
import { Doc } from 'fyo/model/doc';
import { Verb } from 'fyo/telemetry/types';
import { TranslationString } from 'fyo/utils/translation';
import { ModelNameEnum } from 'models/types';
import { Field } from 'schemas/types';
import Button from 'src/components/Button.vue';
import FormContainer from 'src/components/FormContainer.vue';
import FormHeader from 'src/components/FormHeader.vue';
import { getErrorMessage } from 'src/utils';
import { showDialog } from 'src/utils/interactive';
import { getSetupWizardDoc } from 'src/utils/misc';
import { getFieldsGroupedByTabAndSection } from 'src/utils/ui';
import { computed, defineComponent } from 'vue';
import CommonFormSection from '../CommonForm/CommonFormSection.vue';
import { useCreateBusinessMutation } from 'src/data/business';
import { useMe } from 'src/data/user';

export default defineComponent({
  name: 'SetupWizard',
  components: {
    Button,
    FormContainer,
    FormHeader,
    CommonFormSection,
  },
  provide() {
    return {
      doc: computed(() => this.docOrNull),
    };
  },
  emits: ['setup-complete', 'setup-canceled'],
  data() {
    return {
      docOrNull: null,
      errors: {},
      loading: false,
    } as {
      errors: Record<string, string>;
      docOrNull: null | Doc;
      loading: boolean;
    };
  },
  computed: {
    hasDoc(): boolean {
      return this.docOrNull instanceof Doc;
    },
    doc(): Doc {
      if (this.docOrNull instanceof Doc) {
        return this.docOrNull;
      }

      throw new Error(`Doc is null`);
    },
    areAllValuesFilled(): boolean {
      if (!this.hasDoc) {
        return false;
      }

      const values = this.doc.schema.fields
        .filter((f) => f.required)
        .map((f) => this.doc[f.fieldname]);

      return values.every(Boolean);
    },
    activeGroup(): Map<string, Field[]> {
      if (!this.hasDoc) {
        return new Map();
      }

      const groupedFields = getFieldsGroupedByTabAndSection(
        this.doc.schema,
        this.doc
      );

      return [...groupedFields.values()][0];
    },
  },
  async mounted() {
    const { me, isLoading } = useMe()
    const languageMap = TranslationString.prototype.languageMap;
    this.docOrNull = getSetupWizardDoc(languageMap);
    if (!this.fyo.db.isConnected) {
      await this.fyo.db.init();
    }

    if (this.fyo.store.isDevelopment) {
      // @ts-ignore
      window.sw = this;
    }

    const user = me.value;

    await this.doc.set('email', user?.email);
    await this.doc.set('fullname', user?.name);


    this.fyo.telemetry.log(Verb.Started, ModelNameEnum.SetupWizard);
  },
  methods: {
    async fill() {
      if (!this.hasDoc) {
        return;
      }

      await this.doc.set('companyName', "Lin's Things");
      await this.doc.set('email', 'lin@lthings.com');
      await this.doc.set('fullname', 'Lin Slovenly');
      await this.doc.set('bankName', 'Max Finance');
      await this.doc.set('country', 'India');
    },
    async onValueChange(field: Field, value: DocValue) {
      if (!this.hasDoc) {
        return;
      }

      const { fieldname } = field;
      delete this.errors[fieldname];

      try {
        await this.doc.set(fieldname, value);
      } catch (err) {
        if (!(err instanceof Error)) {
          return;
        }

        this.errors[fieldname] = getErrorMessage(err, this.doc);
      }
    },
    async submit() {
      if (!this.hasDoc) {
        return;
      }

      if (!this.areAllValuesFilled) {
        return await showDialog({
          title: this.t`Mandatory Error`,
          detail: this.t`Please fill all values.`,
          type: 'error',
        });
      }

      const data = this.doc.getValidDict();

      console.log(data);


      const payload = {
        currency: data.currency as string,
        name: data.companyName as string,
        country: data.country as string,
        chartOfAccounts: data.chartOfAccounts as string,
        industry: "General",
        fiscalYearStart: (data.fiscalYearStart as Date).toISOString(),
        fiscalYearEnd: (data.fiscalYearEnd as Date).toISOString(),
      };

      // this.isLoading

      this.loading = true;
      await this.createBusiness(payload, {
        onSuccess: (data) => {
          this.fyo.telemetry.log(Verb.Completed, ModelNameEnum.SetupWizard);
          this.$emit('setup-complete', { ...this.doc.getValidDict(), ...payload, ...data });
        },
        onError: (error) => {
          console.error(error);
          this.loading = false;
        },
        onSettled: () => {
          this.loading = false;
        },
      });
    },
    cancel() {
      this.fyo.telemetry.log(Verb.Cancelled, ModelNameEnum.SetupWizard);
      this.$emit('setup-canceled');
    },
  },
  setup() {
    const { mutateAsync, isPending } = useCreateBusinessMutation()
    return {
      createBusiness: mutateAsync,
      isLoading: isPending,
    };

  }
});
</script>
