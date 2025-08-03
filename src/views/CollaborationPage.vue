// This is the project management page: displays references, allows in-place editing, adding comments, with real-time updates.

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { supabase } from '../lib/clients'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const GET_BIBS = gql`
  query GetBibs($projectId: UUID!) {
    bibsCollection(filter: { project_id: { eq: $projectId } }, orderBy: [{ created_at: AscNullsFirst }]) {
      edges {
        node {
          id
          author
          title
          url
          bibtex
          commentsCollection(orderBy: [{ created_at: AscNullsFirst }]) {
            edges {
              node {
                id
                text
              }
            }
          }
        }
      }
    }
  }
`

const UPDATE_BIB = gql`
  mutation UpdateBib($id: UUID!, $set: bibsUpdateInput!) {
    updatebibsCollection(filter: { id: { eq: $id } }, set: $set) {
      records {
        id
      }
    }
  }
`

const INSERT_COMMENT = gql`
  mutation InsertComment($objects: [commentsInsertInput!]!) {
    insertIntocommentsCollection(objects: $objects) {
      records {
        id
      }
    }
  }
`

const route = useRoute()
const projectId = route.params.id as string

const { result, refetch, onResult } = useQuery(GET_BIBS, { projectId })
const { mutate: updateBib } = useMutation(UPDATE_BIB)
const { mutate: insertComment } = useMutation(INSERT_COMMENT)

const initialLoading = ref(true)
onResult(() => {
  initialLoading.value = false
})

const bibs = computed(() => {
  if (!result.value?.bibsCollection?.edges) return []
  return result.value.bibsCollection.edges.map((edge: any) => {
    const comments = edge.node.commentsCollection?.edges.map((commentEdge: any) => commentEdge.node) || []
    return {
      ...edge.node,
      comments: comments,
    }
  })
})

let channel: any

onMounted(() => {
  channel = supabase.channel('db-changes')
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bibs' }, () => refetch())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => refetch())
    .subscribe()
})

onUnmounted(() => {
  supabase.removeChannel(channel)
})

async function save(event: Event, id: string, field: string) {
  const target = event.target as HTMLElement
  const value = target.innerText
  await updateBib({ id, set: { [field]: value } })
}

async function addComment(bibId: string) {
  const input = document.getElementById(`comment-input-${bibId}`) as HTMLTextAreaElement
  const text = input.value.trim()
  if (!text) return
  await insertComment({ objects: [{ bib_id: bibId, text }] })
  input.value = ''
}

async function exportBibtex() {
  await refetch() // Fetch the latest data from the database

  if (!bibs.value || bibs.value.length === 0) {
    alert('No references to export.')
    return
  }

  const bibtexContent = bibs.value.map((b: any) => b.bibtex).join('\n\n')

  const blob = new Blob([bibtexContent], { type: 'application/x-bibtex' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `project-${projectId}.bib`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Project {{ projectId }}</h1>
      <Button @click="exportBibtex">Export to .bib</Button>
    </div>

    <div v-if="initialLoading" class="text-center">Loading...</div>
    <div v-else class="space-y-4">
      <Card v-for="bib in bibs" :key="bib.id">
        <CardHeader>
          <CardTitle>{{ bib.title }}</CardTitle>
          <CardDescription>{{ bib.author }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-1.5">
            <Label>URL</Label>
            <div
              contenteditable
              @blur="save($event, bib.id, 'url')"
              class="min-h-[20px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              {{ bib.url }}
            </div>
          </div>
          <div class="grid gap-1.5">
            <Label>BibTeX</Label>
            <div
              contenteditable
              @blur="save($event, bib.id, 'bibtex')"
              class="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-mono whitespace-pre-wrap"
            >
              {{ bib.bibtex }}
            </div>
          </div>
        </CardContent>
        <CardFooter class="flex-col items-start">
          <Label class="mb-2">Comments</Label>
          <div v-if="bib.comments.length > 0" class="mb-2 w-full">
            <div
              v-for="comment in bib.comments"
              :key="comment.id"
              class="text-sm text-muted-foreground ml-4 border-l-2 pl-4"
            >
              {{ comment.text }}
            </div>
          </div>
          <Textarea
            :id="'comment-input-' + bib.id"
            rows="2"
            class="w-full"
            placeholder="Add a comment..."
          />
          <Button @click="addComment(bib.id)" class="mt-2">Add Comment</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>