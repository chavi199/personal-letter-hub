import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createContentItem,
  deleteContentItem,
  fetchAllContentItems,
  importContentItems,
  updateContentItem,
} from "../lib/api/content"

export const contentKey = {
  all: ["content"] as const,
}

export function useContentItems() {
  return useQuery({ queryKey: contentKey.all, queryFn: fetchAllContentItems })
}

export function useCreateContentItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      type,
      content,
      category,
    }: {
      type: "opening" | "compliment" | "closing"
      content: string
      category?: string
    }) => createContentItem(type, content, category),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKey.all }),
  })
}

export function useImportContentItems() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      type,
      items,
    }: {
      type: "opening" | "compliment" | "closing"
      items: Array<{ content: string; category?: string }>
    }) => importContentItems(type, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKey.all }),
  })
}

export function useUpdateContentItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      content,
      category,
    }: {
      id: string
      content: string
      category?: string
    }) => updateContentItem(id, content, category),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKey.all }),
  })
}

export function useDeleteContentItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteContentItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKey.all }),
  })
}
