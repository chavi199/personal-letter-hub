import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createGroup,
  deleteGroup,
  fetchGroupById,
  fetchGroups,
  updateGroup,
} from "../lib/api/groups"

export const groupsKey = {
  all: ["groups"] as const,
  byId: (id: string) => ["groups", id] as const,
}

export function useGroups() {
  return useQuery({ queryKey: groupsKey.all, queryFn: fetchGroups })
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: groupsKey.byId(id),
    queryFn: () => fetchGroupById(id),
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createGroup(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupsKey.all }),
  })
}

export function useUpdateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateGroup(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupsKey.all }),
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupsKey.all }),
  })
}
