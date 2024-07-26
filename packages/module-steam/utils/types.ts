/**
 * The response of `IPublishedFileService/QueryFiles/v1` endpoint.
 */
export interface WorkshopSearchResult {
  response: {
    total: number
    publishedfiledetails: WorkshopItem[]
  }
}

export interface WorkshopTag {
  tag: string
  display_name: string
}

export interface WorkshopItem {
  result: number
  publishedfileid: string
  creator: string
  creator_appid: number
  consumer_appid: number
  consumer_shortcutid: number
  filename: string
  file_size: string
  preview_file_size: string
  preview_url: string
  url: string
  hcontent_file: string
  hcontent_preview: string
  title: string
  file_description: string
  short_description: boolean
  time_created: number
  time_updated: number
  visibility: number
  flags: number
  workshop_file: boolean
  workshop_accepted: boolean
  show_subscribe_all: boolean
  num_comments_public: number
  banned: boolean
  ban_reason: string
  banner: string
  can_be_deleted: boolean
  app_name: string
  file_type: number
  can_subscribe: boolean
  subscriptions: number
  favorited: number
  followers: number
  lifetime_subscriptions: number
  lifetime_favorited: number
  lifetime_followers: number
  lifetime_playtime: string
  lifetime_playtime_sessions: string
  views: number
  num_children: number
  num_reports: number
  tags: WorkshopTag[]
  language: number
  maybe_inappropriate_sex: boolean
  maybe_inappropriate_violence: boolean
  revision_change_number: string
  revision: number
  ban_text_check_result: number
  file_url?: string
}

/**
 * The response of `IPublishedFileService/GetDetails/v1` endpoint.
 */
export interface WorkshopItemResult {
  response: {
    publishedfiledetails: WorkshopItemDetail[]
  }
}

export interface WowkshopItemPreview {
  previewid: string
  sortorder: number
  youtubevideoid?: string
  preview_type: number
  external_reference?: string
  url?: string
  size?: number
  filename?: string
}

export interface WorkshopItemDetail {
  result: number
  publishedfileid: string
  creator: string
  creator_appid: number
  consumer_appid: number
  consumer_shortcutid: number
  filename: string
  file_size: string
  preview_file_size: string
  preview_url: string
  url: string
  hcontent_file: string
  hcontent_preview: string
  title: string
  file_description: string
  time_created: number
  time_updated: number
  visibility: number
  flags: number
  workshop_file: boolean
  workshop_accepted: boolean
  show_subscribe_all: boolean
  num_comments_public: number
  banned: boolean
  ban_reason: string
  banner: string
  can_be_deleted: boolean
  app_name: string
  file_type: number
  can_subscribe: boolean
  subscriptions: number
  favorited: number
  followers: number
  lifetime_subscriptions: number
  lifetime_favorited: number
  lifetime_followers: number
  lifetime_playtime: string
  lifetime_playtime_sessions: string
  views: number
  num_children: number
  num_reports: number
  previews?: WowkshopItemPreview[]
  tags: WorkshopTag[]
  kvtags: Array<{ key: string; value: string }>
  vote_data: { score: number; votes_up: number; votes_down: number }
  language: number
  maybe_inappropriate_sex: boolean
  maybe_inappropriate_violence: boolean
  revision_change_number: string
  revision: number
  reactions: Array<{ reactionid: number; count: number }>
  ban_text_check_result: number
}
