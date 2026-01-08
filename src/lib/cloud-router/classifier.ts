// ═══════════════════════════════════════════════════════════════
// BUNKER Cloud Router - Frontend Task Classifier
// Provides instant classification feedback in the UI
// Mirrors src-tauri/src/cloud_router/classifier.rs
// ═══════════════════════════════════════════════════════════════

import { TaskCategory, TaskClassification, CloudProvider, CATEGORY_INFO } from './types';

interface CategoryPatterns {
  category: TaskCategory;
  patterns: Array<{ keyword: string; weight: number }>;
}

const PATTERNS: CategoryPatterns[] = [
  {
    category: 'code',
    patterns: [
      { keyword: 'rust', weight: 2.0 },
      { keyword: 'typescript', weight: 2.0 },
      { keyword: 'javascript', weight: 2.0 },
      { keyword: 'python', weight: 2.0 },
      { keyword: 'java', weight: 1.5 },
      { keyword: 'c++', weight: 1.5 },
      { keyword: 'golang', weight: 1.5 },
      { keyword: 'function', weight: 1.5 },
      { keyword: 'class', weight: 1.0 },
      { keyword: 'debug', weight: 2.0 },
      { keyword: 'implement', weight: 1.5 },
      { keyword: 'refactor', weight: 2.0 },
      { keyword: 'optimize', weight: 1.5 },
      { keyword: 'algorithm', weight: 2.0 },
      { keyword: 'data structure', weight: 2.0 },
      { keyword: 'api', weight: 1.5 },
      { keyword: 'endpoint', weight: 1.5 },
      { keyword: 'database', weight: 1.5 },
      { keyword: 'sql', weight: 2.0 },
      { keyword: 'regex', weight: 1.5 },
      { keyword: 'compile', weight: 1.5 },
      { keyword: 'syntax', weight: 1.5 },
      { keyword: 'error', weight: 1.0 },
      { keyword: 'bug', weight: 1.5 },
      { keyword: 'fix', weight: 1.0 },
      { keyword: 'code', weight: 1.5 },
      { keyword: 'programming', weight: 1.5 },
      { keyword: 'script', weight: 1.0 },
      { keyword: 'library', weight: 1.0 },
      { keyword: 'framework', weight: 1.0 },
      { keyword: 'test', weight: 1.0 },
      { keyword: 'unit test', weight: 1.5 },
    ],
  },
  {
    category: 'analysis',
    patterns: [
      { keyword: 'analyze', weight: 2.0 },
      { keyword: 'compare', weight: 1.5 },
      { keyword: 'evaluate', weight: 1.5 },
      { keyword: 'review', weight: 1.5 },
      { keyword: 'examine', weight: 1.5 },
      { keyword: 'assess', weight: 1.5 },
      { keyword: 'breakdown', weight: 1.5 },
      { keyword: 'pros and cons', weight: 2.0 },
      { keyword: 'tradeoffs', weight: 2.0 },
      { keyword: 'trade-offs', weight: 2.0 },
      { keyword: 'advantages', weight: 1.0 },
      { keyword: 'disadvantages', weight: 1.0 },
      { keyword: 'differences', weight: 1.5 },
      { keyword: 'similarities', weight: 1.5 },
    ],
  },
  {
    category: 'reasoning',
    patterns: [
      { keyword: 'why', weight: 1.5 },
      { keyword: 'explain', weight: 1.5 },
      { keyword: 'how does', weight: 1.5 },
      { keyword: 'logic', weight: 2.0 },
      { keyword: 'deduce', weight: 2.0 },
      { keyword: 'because', weight: 1.0 },
      { keyword: 'reason', weight: 1.5 },
      { keyword: 'understand', weight: 1.0 },
      { keyword: 'clarify', weight: 1.0 },
      { keyword: 'what if', weight: 1.5 },
      { keyword: 'implications', weight: 1.5 },
      { keyword: 'consequence', weight: 1.5 },
    ],
  },
  {
    category: 'research',
    patterns: [
      { keyword: 'search', weight: 2.0 },
      { keyword: 'find', weight: 1.5 },
      { keyword: 'latest', weight: 2.0 },
      { keyword: 'current', weight: 1.5 },
      { keyword: 'news', weight: 2.0 },
      { keyword: '2024', weight: 2.0 },
      { keyword: '2025', weight: 2.0 },
      { keyword: '2026', weight: 2.0 },
      { keyword: 'recent', weight: 2.0 },
      { keyword: 'update', weight: 1.0 },
      { keyword: 'today', weight: 1.5 },
      { keyword: 'this week', weight: 2.0 },
      { keyword: 'trending', weight: 2.0 },
      { keyword: 'what happened', weight: 2.0 },
      { keyword: 'who is', weight: 1.5 },
      { keyword: 'where is', weight: 1.5 },
      { keyword: 'when did', weight: 1.5 },
      { keyword: 'statistics', weight: 1.5 },
      { keyword: 'data about', weight: 1.5 },
      { keyword: 'look up', weight: 2.0 },
      { keyword: 'facts about', weight: 1.5 },
    ],
  },
  {
    category: 'creative',
    patterns: [
      { keyword: 'write', weight: 1.5 },
      { keyword: 'story', weight: 2.0 },
      { keyword: 'brainstorm', weight: 2.0 },
      { keyword: 'imagine', weight: 2.0 },
      { keyword: 'creative', weight: 2.0 },
      { keyword: 'ideas', weight: 1.5 },
      { keyword: 'fiction', weight: 2.0 },
      { keyword: 'poem', weight: 2.0 },
      { keyword: 'poetry', weight: 2.0 },
      { keyword: 'narrative', weight: 2.0 },
      { keyword: 'character', weight: 1.5 },
      { keyword: 'plot', weight: 1.5 },
      { keyword: 'dialogue', weight: 1.5 },
      { keyword: 'screenplay', weight: 2.0 },
      { keyword: 'novel', weight: 2.0 },
      { keyword: 'blog', weight: 1.5 },
      { keyword: 'article', weight: 1.0 },
      { keyword: 'content', weight: 1.0 },
      { keyword: 'copywriting', weight: 2.0 },
      { keyword: 'marketing', weight: 1.5 },
      { keyword: 'slogan', weight: 2.0 },
      { keyword: 'tagline', weight: 2.0 },
    ],
  },
  {
    category: 'general',
    patterns: [
      { keyword: 'summarize', weight: 1.5 },
      { keyword: 'translate', weight: 2.0 },
      { keyword: 'list', weight: 1.0 },
      { keyword: 'format', weight: 1.0 },
      { keyword: 'convert', weight: 1.0 },
      { keyword: 'rewrite', weight: 1.0 },
      { keyword: 'simplify', weight: 1.0 },
      { keyword: 'help', weight: 0.5 },
      { keyword: 'what is', weight: 1.0 },
      { keyword: 'define', weight: 1.0 },
    ],
  },
  {
    category: 'image',
    patterns: [
      { keyword: 'image', weight: 2.0 },
      { keyword: 'picture', weight: 2.0 },
      { keyword: 'generate image', weight: 3.0 },
      { keyword: 'create image', weight: 3.0 },
      { keyword: 'dall-e', weight: 3.0 },
      { keyword: 'dalle', weight: 3.0 },
      { keyword: 'draw', weight: 2.0 },
      { keyword: 'illustration', weight: 2.0 },
      { keyword: 'visual', weight: 1.5 },
      { keyword: 'photo', weight: 1.5 },
      { keyword: 'artwork', weight: 2.0 },
    ],
  },
];

/**
 * Get the suggested provider for a category
 */
function getSuggestedProvider(category: TaskCategory): CloudProvider {
  return CATEGORY_INFO[category].suggestedProvider;
}

/**
 * Generate human-readable reasoning for the classification
 */
function generateReasoning(
  category: TaskCategory,
  keywords: string[],
  confidence: number
): string {
  const confidenceLevel =
    confidence > 0.8 ? 'High' : confidence > 0.5 ? 'Medium' : 'Low';

  const categoryDescriptions: Record<TaskCategory, string> = {
    code: 'code-related task',
    analysis: 'analytical task',
    reasoning: 'reasoning/explanation task',
    research: 'research/current information task',
    creative: 'creative writing task',
    general: 'general utility task',
    image: 'image generation task',
  };

  const providerReasons: Record<TaskCategory, string> = {
    code: 'Claude excels at code generation and debugging',
    analysis: 'Claude provides thorough analytical breakdowns',
    reasoning: 'Claude offers detailed logical explanations',
    research: 'Perplexity has real-time web search capabilities',
    creative: 'ChatGPT is strong at creative content generation',
    general: 'ChatGPT handles general tasks efficiently',
    image: 'ChatGPT has DALL-E integration for image generation',
  };

  const categoryDesc = categoryDescriptions[category];
  const providerReason = providerReasons[category];

  if (keywords.length === 0) {
    return `${confidenceLevel} confidence: Classified as ${categoryDesc} (default). ${providerReason}.`;
  }

  const topKeywords = keywords.slice(0, 3).map((k) => `'${k}'`).join(', ');
  return `${confidenceLevel} confidence: Detected ${categoryDesc} based on keywords: ${topKeywords}. ${providerReason}.`;
}

/**
 * Classify a task prompt into a category with confidence score
 * This runs entirely in the frontend for instant feedback
 */
export function classifyTask(prompt: string): TaskClassification {
  const promptLower = prompt.toLowerCase();

  // Initialize scores
  const scores: Record<TaskCategory, number> = {
    code: 0,
    analysis: 0,
    reasoning: 0,
    research: 0,
    creative: 0,
    general: 0,
    image: 0,
  };

  const matchedKeywords: string[] = [];

  // Score each category
  for (const { category, patterns } of PATTERNS) {
    for (const { keyword, weight } of patterns) {
      if (promptLower.includes(keyword)) {
        scores[category] += weight;
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
    }
  }

  // Code block detection (high confidence for code)
  if (
    prompt.includes('```') ||
    prompt.includes('fn ') ||
    prompt.includes('function ') ||
    prompt.includes('def ') ||
    prompt.includes('class ')
  ) {
    scores.code += 3.0;
    if (!matchedKeywords.includes('code_block')) {
      matchedKeywords.push('code_block');
    }
  }

  // Length modifier (longer prompts tend to be more complex)
  if (prompt.length > 500) {
    scores.analysis += 1.0;
    scores.reasoning += 0.5;
  }

  // Question detection
  if (prompt.trim().endsWith('?')) {
    scores.research += 0.5;
  }

  // Find the highest scoring category
  let maxScore = 0;
  let maxCategory: TaskCategory = 'general';

  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category as TaskCategory;
    }
  }

  // Calculate confidence (normalize to 0-1 range, cap at 0.99)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0
    ? Math.min(maxScore / totalScore, 0.99)
    : 0.5; // Default confidence if no patterns matched

  // Generate reasoning
  const reasoning = generateReasoning(maxCategory, matchedKeywords, confidence);

  // Sort and dedupe keywords
  const uniqueKeywords = [...new Set(matchedKeywords)].sort();

  return {
    category: maxCategory,
    confidence,
    suggested_provider: getSuggestedProvider(maxCategory),
    reasoning,
    keywords_matched: uniqueKeywords,
  };
}

/**
 * Debounced classifier for use during typing
 */
export function createDebouncedClassifier(
  callback: (result: TaskClassification) => void,
  delay: number = 300
): (prompt: string) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (prompt: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const result = classifyTask(prompt);
      callback(result);
    }, delay);
  };
}
