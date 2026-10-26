import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createPerson,
  deletePerson,
  fetchAllPeople,
  fetchPeopleByGroup,
  fetchPersonById,
  importPeople,
  updateLetterStatus,
  updatePerson,
} from "../lib/api/people"
import type { DbPerson, LetterStatus } from "../lib/supabase"

export const peopleKey = {
  all: ["people"] as const,
  byGroup: (groupId: string) => ["people", "group", groupId] as const,
  byId: (id: string) => ["people", id] as const,
}

export function usePeopleByGroup(groupId: string) {
  return useQuery({
    queryKey: peopleKey.byGroup(groupId),
    queryFn: () => fetchPeopleByGroup(groupId),
  })
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: peopleKey.byId(id),
    queryFn: () => fetchPersonById(id),
  })
}

export function useAllPeople() {
  return useQuery({ queryKey: peopleKey.all, queryFn: fetchAllPeople })
}

export function useCreatePerson(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createPerson(groupId, name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: peopleKey.byGroup(groupId) }),
  })
}

export function useImportPeople(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (names: string[]) => importPeople(groupId, names),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: peopleKey.byGroup(groupId) }),
  })
}

export function useUpdatePerson(personId: string, groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (fields: Partial<Omit<DbPerson, "id" | "group_id" | "user_id" | "created_at">>) =>
      updatePerson(personId, fields),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: peopleKey.byId(personId) })
      qc.invalidateQueries({ queryKey: peopleKey.byGroup(groupId) })
    },
  })
}

export function useUpdateLetterStatus(personId: string, groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: LetterStatus) => updateLetterStatus(personId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: peopleKey.byId(personId) })
      qc.invalidateQueries({ queryKey: peopleKey.byGroup(groupId) })
      qc.invalidateQueries({ queryKey: peopleKey.all })
    },
  })
}

export function useDeletePerson(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePerson(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: peopleKey.byGroup(groupId) }),
  })
}
