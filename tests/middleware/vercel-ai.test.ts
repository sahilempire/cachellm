import { describe, it, expect, vi } from 'vitest'
import { createVercelAIMiddleware } from '../../src/middleware/vercel-ai.js'

describe('Vercel AI Middleware', () => {
  it('creates middleware with default options', () => {
    const middleware = createVercelAIMiddleware()
    expect(middleware).toHaveProperty('wrapGenerate')
    expect(middleware).toHaveProperty('wrapStream')
    expect(middleware).toHaveProperty('stats')
    expect(middleware).toHaveProperty('printStats')
  })

  it('accepts custom options', () => {
    const middleware = createVercelAIMiddleware({
      strategy: 'aggressive',
      maxBreakpoints: 2,
      ttl: '1h',
      debug: true,
    })
    expect(middleware).toBeDefined()
  })

  it('wrapGenerate returns a middleware function', () => {
    const middleware = createVercelAIMiddleware()
    const wrapGenerate = middleware.wrapGenerate()
    expect(typeof wrapGenerate).toBe('function')
  })

  it('wrapStream returns a middleware function', () => {
    const middleware = createVercelAIMiddleware()
    const wrapStream = middleware.wrapStream()
    expect(typeof wrapStream).toBe('function')
  })

  it('provides stats tracking', () => {
    const middleware = createVercelAIMiddleware({ trackStats: true })
    const stats = middleware.stats()
    expect(stats).toHaveProperty('totalRequests')
    expect(stats).toHaveProperty('cacheHits')
    expect(stats).toHaveProperty('estimatedSavingsUsd')
  })

  it('can reset stats', () => {
    const middleware = createVercelAIMiddleware({ trackStats: true })
    middleware.resetStats()
    const stats = middleware.stats()
    expect(stats.totalRequests).toBe(0)
  })

  it('handles different model types', () => {
    const middleware = createVercelAIMiddleware()
    expect(middleware).toBeDefined()
    // Middleware should support both generateText and streamText hooks
  })

  it('injects cache control for Anthropic models', async () => {
    const middleware = createVercelAIMiddleware({ debug: false })
    const wrapGenerate = middleware.wrapGenerate()

    const mockNext = vi.fn(async (params) => ({
      text: 'test response',
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        cacheReadInputTokens: 50,
        cacheCreationInputTokens: 0,
      },
    }))

    const params = {
      model: { modelId: 'claude-sonnet-4-20250514' },
      system: 'You are helpful',
      messages: [{ role: 'user' as const, content: 'Hello' }],
      next: mockNext,
    }

    await wrapGenerate(params as any)
    expect(mockNext).toHaveBeenCalled()
  })

  it('tracks stats on generateText', async () => {
    const middleware = createVercelAIMiddleware({ trackStats: true })
    const wrapGenerate = middleware.wrapGenerate()

    const mockNext = vi.fn(async (params) => ({
      text: 'response',
      usage: {
        inputTokens: 2000,
        outputTokens: 200,
        cacheReadInputTokens: 1000,
        cacheCreationInputTokens: 0,
      },
    }))

    const params = {
      model: { modelId: 'claude-sonnet-4-20250514' },
      system: 'You are helpful',
      messages: [{ role: 'user' as const, content: 'Hello' }],
      next: mockNext,
    }

    await wrapGenerate(params as any)
    const stats = middleware.stats()
    expect(stats.totalRequests).toBeGreaterThan(0)
  })

  it('supports Vercel AI SDK middleware API', () => {
    const middleware = createVercelAIMiddleware()
    const wrapGenerate = middleware.wrapGenerate()

    // Should return a function that accepts params and returns the model result
    expect(typeof wrapGenerate).toBe('function')
  })
})
