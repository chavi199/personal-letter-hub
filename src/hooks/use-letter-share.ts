import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createOrRefreshShareLink,
  fetchActiveShareLink,
  revokeShareLink,
  rotateShareLink,
} from "@/lib/api/letter-share"
import type { LetterDesignConfig } from "@/lib/design-themes"

export const shareKey = {
  byPerson: (personId: string) => ["letter_share_link", personId] as const,
}

export function useActiveShareLink(personId: string) {
  return useQuery({
    queryKey: shareKey.byPerson(personId),
    queryFn: () => fetchActiveShareLink(personId),
  })
}

type SharePayload = {
  recipientName: string
  letterContent: string
  designConfig?: LetterDesignConfig | null
}

export function useCreateOrRefreshShareLink(personId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SharePayload) =>
      createOrRefreshShareLink({ personId, ...payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: shareKey.byPerson(personId) }),
  })
}

export function useRotateShareLink(personId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SharePayload) => rotateShareLink({ personId, ...payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: shareKey.byPerson(personId) }),
  })
}

export function useRevokeShareLink(personId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => revokeShareLink(personId),
    onSuccess: () => qc.invalidateQueries({ queryKey: shareKey.byPerson(personId) }),
  })
}
