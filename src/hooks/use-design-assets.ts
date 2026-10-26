import { useMutation } from "@tanstack/react-query"
import { uploadDesignAsset, deleteDesignAsset } from "@/lib/api/design-assets"

export function useUploadDesignAsset() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: "logo" | "background" }) =>
      uploadDesignAsset(file, type),
  })
}

export function useDeleteDesignAsset() {
  return useMutation({
    mutationFn: (url: string) => deleteDesignAsset(url),
  })
}
