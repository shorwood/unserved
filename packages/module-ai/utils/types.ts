export interface OpenAI_CompletionResponse {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    logprobs: null | number
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface OpenAI_ImageGenerateResponse {
  created: number
  data: Array<{ url: string }>
}
