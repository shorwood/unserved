import type { MaybeArray } from '@unshared/types'
import type { ModuleAI } from '../index'
import type { OpenAI_CompletionResponse } from './types'
import { toArray } from '@unshared/collection'

export interface OpenaiCompleteOptions {
  model?: string
  maxTokens?: number
  system?: string
  messages: MaybeArray<Record<string, unknown> | string>
}

/**
 * Completes the given messages using the OpenAI API and returns the completion
 * response from the API. The completion response contains the generated text
 * based on the input messages and the AI model used.
 *
 * @param this The module instance.
 * @param options The options to complete the messages.
 * @returns The completion response from the OpenAI API.
 */
export async function openaiComplete(this: ModuleAI, options: OpenaiCompleteOptions): Promise<string> {

  // --- Assert the OpenAI API key and URL are set.
  if (!this.aiOpenaiKey) throw this.errors.AI_OPENAI_KEY_NOT_SET()
  if (!this.aiOpenaiUrl) throw this.errors.AI_OPENAI_URL_NOT_SET()

  // --- Create a system message if provided.
  const messageSystem = options.system
    ? { role: 'system', content: [{ type: 'text', text: options.system }] }
    : undefined

  // --- Convert the messages to the OpenAI format.
  const messages = {
    role: 'user',
    content: toArray(options.messages)
      .map(message => (typeof message === 'string' ? { type: 'text', text: message } : message)),
  }

  // --- Send the completion request to the OpenAI API.
  const url = new URL('v1/chat/completions', this.aiOpenaiUrl)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.aiOpenaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      max_tokens: options.maxTokens,
      messages: [messageSystem, messages],
    }),
  })

  // --- Get the response from the OpenAI API.
  if (!response.ok) throw await this.errors.AI_OPENAI_ERROR(response)
  const completion = await response.json() as OpenAI_CompletionResponse
  return completion.choices[0].message.content
}
