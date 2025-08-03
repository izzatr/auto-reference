import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { provideApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './lib/clients'
import router from './router'


createApp(App).use(router).mount('#app')
provideApolloClient(apolloClient)