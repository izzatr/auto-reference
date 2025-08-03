import { createClient } from '@supabase/supabase-js'
import { ApolloClient, InMemoryCache } from '@apollo/client/core'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const apolloClient = new ApolloClient({
  uri: import.meta.env.VITE_SUPABASE_GRAPHQL_URL,
  cache: new InMemoryCache(),
  headers: {
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  },
})