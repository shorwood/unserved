import { ModuleStorage } from '@unserved/module-storage'
import { ModuleUser } from '@unserved/module-user'
import { ModuleBase } from '@unserved/server'
import * as ROUTES from './routes'
import { ERRORS, openaiComplete, PERMISSIONS } from './utils'

export type ModuleAIOptions = Partial<Pick<
  ModuleAI,
  'aiOpenaiKey'
  | 'aiOpenaiUrl'
  | 'aiReplicateKey'
  | 'aiReplicateUrl'
>>

/**
 * The `ModuleAI` module provides a way to interact with various generative AI
 * models and services. It is used to generate images, text as well as summarize
 * images and text using services such as OpenAI, Ollama, and others.
 */
export class ModuleAI extends ModuleBase {
  errors = ERRORS
  routes = ROUTES
  permissions = PERMISSIONS
  dependencies = [ModuleUser, ModuleStorage]

  constructor(options: ModuleAIOptions = {}) {
    super()
    if (options.aiOpenaiKey) this.aiOpenaiKey = options.aiOpenaiKey
    if (options.aiOpenaiUrl) this.aiOpenaiUrl = options.aiOpenaiUrl
    if (options.aiReplicateKey) this.aiReplicateKey = options.aiReplicateKey
    if (options.aiReplicateUrl) this.aiReplicateUrl = options.aiReplicateUrl
  }

  /**
   * The URL of the OpenAI or Ollama API used to interact with the generative AI
   * models. It is used to generate images, text, and other content using the
   * AI models.
   */
  aiOpenaiUrl = process.env.AI_OPENAI_URL ?? 'https://api.openai.com/'

  /**
   * The API key used to authenticate with the OpenAI or Ollama API. It is used
   * to authenticate the requests to the API and access the generative AI models.
   */
  aiOpenaiKey = process.env.AI_OPENAI_KEY ?? ''

  /**
   * The base URL of the Replicate AI API used to interact with the generative AI
   * models. It is used to generate images, text, and other content using the
   */
  aiReplicateUrl = process.env.AI_REPLICATE_URL ?? 'https://api.replicate.ai/'

  /**
   * The API key used to authenticate with the Replicate AI API. It is used
   * to authenticate the requests to the API and access the generative AI models.
   */
  aiReplicateKey = process.env.AI_REPLICATE_KEY ?? ''

  /**
   * Completes the given messages using the OpenAI API and returns the completion
   * response from the API. The completion response contains the generated text
   * based on the input messages and the AI model used.
   *
   * @param this The module instance.
   * @param options The options to complete the messages.
   * @returns The completion response from the OpenAI API.
   */
  openaiComplete = openaiComplete.bind(this)
}
