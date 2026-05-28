import type { CacheOptions } from '../types.js'
import { PromptAnalyzer } from '../core/analyzer.js'
import { selectBreakpoints } from '../core/strategy.js'
import { StatsTracker } from '../stats/tracker.js'

interface VercelAICacheOptions extends CacheOptions {
  maxBreakpoints?: 1 | 2 | 3 | 4
  ttl?: '5m' | '1h'
}

export class VercelAICacheMiddleware {
  private analyzer: PromptAnalyzer
  private statsTracker: StatsTracker
  private options: VercelAICacheOptions

  constructor(options: VercelAICacheOptions = {}) {
    this.analyzer = new PromptAnalyzer()
    this.statsTracker = new StatsTracker()
    this.options = {
      strategy: options.strategy || 'auto',
      maxBreakpoints: options.maxBreakpoints || 4,
      ttl: options.ttl || '5m',
      minTokens: options.minTokens || 1024,
      debug: options.debug || false,
      trackStats: options.trackStats !== false,
      onOptimize: options.onOptimize,
    }
  }

  wrapGenerate() {
    return async (params: any) => {
      const model = params.model
      const system = params.system
      const messages = params.messages || []

      // analyze prompts for caching opportunities
      const systemText = typeof system === 'string' ? system : undefined
      const analysis = this.analyzer.analyzeAnthropicParams({
        system: systemText,
        messages: messages.map((m: any) => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' })),
        tools: undefined,
      })

      // select optimal breakpoints
      const breakpoints = selectBreakpoints(
        analysis.stableSegments,
        {
          strategy: this.options.strategy || 'auto',
          maxBreakpoints: this.options.maxBreakpoints || 4,
          minTokens: this.options.minTokens || 1024,
        }
      )

      if (this.options.debug) {
        console.log(`[cachellm] Placed ${breakpoints.length} cache breakpoints`)
        console.log(`[cachellm] Estimated savings: ${analysis.estimatedSavingsPercent}%`)
      }

      // inject cache control into system prompt if using Anthropic
      let enhancedSystem = system
      if (model.modelId?.includes('claude') && breakpoints.length > 0) {
        enhancedSystem = injectCacheControl(system)
      }

      // modify params to use enhanced system
      const enhancedParams = {
        ...params,
        system: enhancedSystem,
      }

      // call the underlying model
      const result = await params.next(enhancedParams)

      // track stats if enabled
      if (this.options.trackStats) {
        const provider = model.modelId?.includes('gpt') ? 'openai' : model.modelId?.includes('claude') ? 'anthropic' : 'gemini'
        this.statsTracker.record({
          provider: provider as 'anthropic' | 'openai' | 'gemini',
          model: model.modelId || 'unknown',
          totalInputTokens: (result as any).usage?.inputTokens || 0,
          cacheReadTokens: (result as any).usage?.cacheReadInputTokens || 0,
          cacheCreationTokens: (result as any).usage?.cacheCreationInputTokens || 0,
          outputTokens: (result as any).usage?.outputTokens || 0,
        })
      }

      return result
    }
  }

  wrapStream() {
    return async (params: any) => {
      const model = params.model
      const system = params.system
      const messages = params.messages || []

      // analyze prompts for caching opportunities
      const systemText = typeof system === 'string' ? system : undefined
      const analysis = this.analyzer.analyzeAnthropicParams({
        system: systemText,
        messages: messages.map((m: any) => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' })),
        tools: undefined,
      })

      // select optimal breakpoints
      const breakpoints = selectBreakpoints(
        analysis.stableSegments,
        {
          strategy: this.options.strategy || 'auto',
          maxBreakpoints: this.options.maxBreakpoints || 4,
          minTokens: this.options.minTokens || 1024,
        }
      )

      if (this.options.debug) {
        console.log(`[cachellm] Placed ${breakpoints.length} cache breakpoints (stream)`)
      }

      // inject cache control into system prompt if using Anthropic
      let enhancedSystem = system
      if (model.modelId?.includes('claude') && breakpoints.length > 0) {
        enhancedSystem = injectCacheControl(system)
      }

      // modify params to use enhanced system
      const enhancedParams = {
        ...params,
        system: enhancedSystem,
      }

      // call the underlying model
      const result = await params.next(enhancedParams)

      return result
    }
  }

  stats() {
    return this.statsTracker.getStats()
  }

  printStats() {
    this.statsTracker.print()
  }

  resetStats() {
    this.statsTracker.reset()
  }
}

function injectCacheControl(system: any) {
  if (typeof system === 'string') {
    return {
      type: 'text',
      text: system,
      cache_control: { type: 'ephemeral' },
    }
  }

  if (Array.isArray(system)) {
    const enhanced = [...system]
    if (enhanced.length > 0) {
      enhanced[enhanced.length - 1] = {
        ...enhanced[enhanced.length - 1],
        cache_control: { type: 'ephemeral' },
      }
    }
    return enhanced
  }

  return system
}

export function createVercelAIMiddleware(options: VercelAICacheOptions = {}) {
  const middleware = new VercelAICacheMiddleware(options)
  return {
    wrapGenerate: middleware.wrapGenerate.bind(middleware),
    wrapStream: middleware.wrapStream.bind(middleware),
    stats: middleware.stats.bind(middleware),
    printStats: middleware.printStats.bind(middleware),
    resetStats: middleware.resetStats.bind(middleware),
  }
}
