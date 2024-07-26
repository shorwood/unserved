export interface IconCollectionMetadata {
  name: string
  total: number
  version: string
  author: {
    name: string
    url?: string
  }
  license: {
    title: string
    spdx?: string
    url?: string
  }
  samples: string[]
  height: number
  displayHeight: number
  category: string
  tags: string[]
  palette: boolean
}

export interface IconCollectionDownload {
  prefix: string
  icons: Record<string, { body: string }>
  width?: number
  height?: number
}
