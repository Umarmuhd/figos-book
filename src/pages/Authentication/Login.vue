<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md">
      <form
        @submit.prevent="login"
        class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <div class="mb-4">
          <label class="block text-gray-600 text-sm mb-1" for="email">
            Email address
          </label>
          <div class="show-mandatory">
            <input
              class="bg-transparent text-base focus:outline-none w-full placeholder-gray-500 px-3 py-2 text-gray-900 rounded focus-within:bg-gray-100 border border-gray-200 bg-gray-25"
              id="email"
              type="text"
              placeholder="Email address"
              v-model="credentials.email"
            />
          </div>
        </div>
        <div class="mb-6">
          <label class="block text-gray-600 text-sm mb-1" for="password">
            Password
          </label>
          <div class="show-mandatory">
            <input
              class="bg-transparent text-base focus:outline-none w-full placeholder-gray-500 px-3 py-2 text-gray-900 rounded focus-within:bg-gray-100 border border-gray-200 bg-gray-25"
              id="password"
              type="password"
              placeholder="******"
              v-model="credentials.password"
            />
          </div>
        </div>
        <div class="flex">
          <Button
            type="primary"
            class="w-full"
            data-testid="submit-button"
            :disabled="loading"
            @click="onSubmit"
            >{{ t`Submit` }}</Button
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import Button from 'src/components/Button.vue';
import { computed, reactive, ref } from 'vue';
import { useAuth } from '../../stores/auth.store.ts';

const { authorize } = useAuth();

const credentials = reactive({
  email: '',
  password: '',
});

const onSubmit = async () => {
  console.log('Login attempt: ', credentials);
  const response = await axios.post('http://localhost:4000/api/auth/login', {
    email: credentials.email,
    password: credentials.password,
  });

  console.log('Login result: ', response);

  localStorage.setItem('token', response.data.tokens.accessToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  authorize(response.data.tokens.accessToken);
};
</script>
