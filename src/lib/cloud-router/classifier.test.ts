// Cloud Router Classifier Tests

import { describe, it, expect, vi } from 'vitest';
import { classifyTask, createDebouncedClassifier } from './classifier';

describe('classifyTask', () => {
  describe('code classification', () => {
    it('classifies Rust code tasks', () => {
      const result = classifyTask('Fix the Rust function that handles async operations');
      expect(result.category).toBe('code');
      expect(result.keywords_matched).toContain('rust');
      expect(result.suggested_provider).toBe('claude');
    });

    it('classifies TypeScript tasks', () => {
      const result = classifyTask('Implement a TypeScript interface for user authentication');
      expect(result.category).toBe('code');
      expect(result.keywords_matched).toContain('typescript');
    });

    it('classifies tasks with code blocks', () => {
      const result = classifyTask('What does this code do?\n```\nconst x = 5;\n```');
      expect(result.category).toBe('code');
      expect(result.keywords_matched).toContain('code_block');
    });

    it('classifies debugging tasks', () => {
      const result = classifyTask('Debug this error in my Python script');
      expect(result.category).toBe('code');
      expect(result.keywords_matched).toContain('debug');
    });

    it('classifies algorithm tasks', () => {
      const result = classifyTask('Implement a binary search algorithm');
      expect(result.category).toBe('code');
      expect(result.keywords_matched).toContain('algorithm');
    });
  });

  describe('research classification', () => {
    it('classifies current events queries', () => {
      const result = classifyTask('What are the latest news about AI regulation in 2025?');
      expect(result.category).toBe('research');
      expect(result.suggested_provider).toBe('perplexity');
    });

    it('classifies search queries', () => {
      const result = classifyTask('Search for recent developments in quantum computing');
      expect(result.category).toBe('research');
      expect(result.keywords_matched).toContain('search');
    });

    it('classifies date-specific queries', () => {
      const result = classifyTask('What happened this week in the stock market?');
      expect(result.category).toBe('research');
      expect(result.keywords_matched).toContain('this week');
    });
  });

  describe('creative classification', () => {
    it('classifies story writing tasks', () => {
      const result = classifyTask('Write a short story about a robot');
      expect(result.category).toBe('creative');
      expect(result.suggested_provider).toBe('chatgpt');
    });

    it('classifies poetry tasks', () => {
      const result = classifyTask('Write a poem about the ocean');
      expect(result.category).toBe('creative');
      expect(result.keywords_matched).toContain('poem');
    });

    it('classifies brainstorming tasks', () => {
      const result = classifyTask('Brainstorm ideas for a mobile app');
      expect(result.category).toBe('creative');
      expect(result.keywords_matched).toContain('brainstorm');
    });
  });

  describe('analysis classification', () => {
    it('classifies comparison tasks', () => {
      const result = classifyTask('Compare React and Vue frameworks');
      expect(result.category).toBe('analysis');
      expect(result.keywords_matched).toContain('compare');
    });

    it('classifies pros and cons requests', () => {
      const result = classifyTask('What are the pros and cons of microservices?');
      expect(result.category).toBe('analysis');
      expect(result.keywords_matched).toContain('pros and cons');
    });

    it('classifies tradeoffs analysis', () => {
      const result = classifyTask('Explain the tradeoffs between SQL and NoSQL');
      expect(result.category).toBe('analysis');
    });
  });

  describe('reasoning classification', () => {
    it('classifies explanation requests', () => {
      const result = classifyTask('Explain how recursion works');
      expect(result.category).toBe('reasoning');
      expect(result.keywords_matched).toContain('explain');
    });

    it('classifies "why" questions', () => {
      const result = classifyTask('Why does the sky appear blue?');
      expect(result.category).toBe('reasoning');
      expect(result.keywords_matched).toContain('why');
    });
  });

  describe('image classification', () => {
    it('classifies image generation tasks', () => {
      const result = classifyTask('Generate an image of a sunset');
      expect(result.category).toBe('image');
      expect(result.suggested_provider).toBe('chatgpt');
    });

    it('classifies DALL-E requests', () => {
      const result = classifyTask('Use DALL-E to create an illustration');
      expect(result.category).toBe('image');
      expect(result.keywords_matched).toContain('dall-e');
    });
  });

  describe('general classification', () => {
    it('classifies translation tasks', () => {
      const result = classifyTask('Translate this to Spanish');
      expect(result.category).toBe('general');
      expect(result.keywords_matched).toContain('translate');
    });

    it('classifies summarization tasks', () => {
      const result = classifyTask('Summarize this article');
      expect(result.category).toBe('general');
      expect(result.keywords_matched).toContain('summarize');
    });

    it('defaults to general for ambiguous prompts', () => {
      const result = classifyTask('Hello, how are you?');
      expect(result.category).toBe('general');
      expect(result.confidence).toBeLessThan(0.8);
    });
  });

  describe('confidence scores', () => {
    it('returns higher confidence for clear matches', () => {
      const codeResult = classifyTask('Implement a Rust function to parse JSON');
      const vagueResult = classifyTask('Hello');

      expect(codeResult.confidence).toBeGreaterThan(vagueResult.confidence);
    });

    it('caps confidence at 0.99', () => {
      const result = classifyTask('Rust TypeScript Python JavaScript function class debug algorithm');
      expect(result.confidence).toBeLessThanOrEqual(0.99);
    });
  });

  describe('reasoning output', () => {
    it('includes confidence level in reasoning', () => {
      const result = classifyTask('Implement a Rust algorithm');
      expect(result.reasoning).toMatch(/High|Medium|Low/);
    });

    it('includes matched keywords in reasoning', () => {
      const result = classifyTask('Debug this Rust function');
      expect(result.reasoning).toContain('rust');
    });
  });
});

describe('createDebouncedClassifier', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces classification calls', () => {
    const callback = vi.fn();
    const debouncedClassify = createDebouncedClassifier(callback, 300);

    debouncedClassify('test');
    debouncedClassify('test2');
    debouncedClassify('test3');

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      category: expect.any(String),
      confidence: expect.any(Number),
    }));
  });

  it('calls callback with classification result', () => {
    const callback = vi.fn();
    const debouncedClassify = createDebouncedClassifier(callback, 100);

    debouncedClassify('Write Rust code');
    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      category: 'code',
      suggested_provider: 'claude',
    }));
  });
});
