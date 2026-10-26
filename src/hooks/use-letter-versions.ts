import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteVersion, fetchVersionsByPerson, saveVersion } from "@/lib/api/letter-versions"
import type { LetterDesignConfig } from "@/lib/design-themes"

export const versionsKey = {
  byPerson: (personId: string) => ["letter_versions", personId] as const,
}

export function useLetterVersions(personId: string) {
  return useQuery({
    queryKey: versionsKey.byPerson(personId),
    queryFn: () => fetchVersionsByPerson(personId),
  })
}

export function useSaveVersion(personId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ content, designConfig }: { content: string; designConfig?: LetterDesignConfig }) =>
      saveVersion(personId, content, designConfig),
    onSuccess: () => qc.invalidateQueries({ queryKey: versionsKey.byPerson(personId) }),
  })
}

export function useDeleteVersion(personId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVersion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: versionsKey.byPerson(personId) }),
  })
}
