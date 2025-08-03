// This is the home page with textarea for URLs and processing logic to call n8n, create project/references in Supabase, then navigate.

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const CREATE_PROJECT = gql`
  mutation CreateProject($objects: [projectsInsertInput!]!) {
    insertIntoprojectsCollection(objects: $objects) {
      records {
        id
      }
    }
  }
`

const INSERT_BIBS = gql`
  mutation InsertBibs($objects: [bibsInsertInput!]!) {
    insertIntobibsCollection(objects: $objects) {
      records {
        id
      }
    }
  }
`

const urls = ref('')
const router = useRouter()
const isLoading = ref(false)

async function process() {
  const multiLineUrls = urls.value.trim()
  if (!multiLineUrls) return

  isLoading.value = true
  try {
    const res = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ URLs: multiLineUrls }),
    })
    const parsed = await res.json()

    const { mutate: createProject } = useMutation(CREATE_PROJECT)

    const now = new Date().toISOString()
    const result = await createProject({ objects: [{ created_at: now }] })
    const projectId = result?.data?.insertIntoprojectsCollection.records[0].id

    const objects = parsed.map((p: any) => ({ ...p, project_id: projectId }))

    const { mutate: insertBibs } = useMutation(INSERT_BIBS)
    await insertBibs({ objects })

    router.push(`/project/${projectId}`)
  } catch (error) {
    console.error('An error occurred during processing:', error)
    alert('Failed to process URLs. Please check the console for more details.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="w-full max-w-2xl p-4 space-y-4">
      <h1 class="text-3xl font-bold text-center">Create a New Bibliography</h1>
      <p class="text-center text-muted-foreground">
        Paste URLs (one per line) to automatically generate a bibliography.
      </p>
      <Textarea
        v-model="urls"
        rows="10"
        placeholder="Paste URLs here..."
        :disabled="isLoading"
      />
      <Button @click="process" :disabled="isLoading" class="w-full">
        {{ isLoading ? 'Processing...' : 'Process URLs' }}
      </Button>
    </div>
  </div>
</template>