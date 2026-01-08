// Task Classifier
// Rule-based classification for routing tasks to appropriate providers

use crate::cloud_router::types::{CloudProvider, TaskCategory, TaskClassification};
use regex::Regex;

/// Keyword patterns for each category with their weights
struct CategoryPattern {
    category: TaskCategory,
    keywords: Vec<(&'static str, f32)>, // (pattern, weight)
}

/// Classify a task prompt into a category with confidence score
pub fn classify_task(prompt: &str) -> TaskClassification {
    let prompt_lower = prompt.to_lowercase();
    let mut scores: std::collections::HashMap<TaskCategory, f32> = std::collections::HashMap::new();
    let mut matched_keywords: Vec<String> = Vec::new();

    // Initialize all scores to 0
    scores.insert(TaskCategory::Code, 0.0);
    scores.insert(TaskCategory::Analysis, 0.0);
    scores.insert(TaskCategory::Reasoning, 0.0);
    scores.insert(TaskCategory::Research, 0.0);
    scores.insert(TaskCategory::Creative, 0.0);
    scores.insert(TaskCategory::General, 0.0);
    scores.insert(TaskCategory::Image, 0.0);

    // Code patterns
    let code_patterns = [
        ("rust", 2.0),
        ("typescript", 2.0),
        ("javascript", 2.0),
        ("python", 2.0),
        ("java", 1.5),
        ("c++", 1.5),
        ("golang", 1.5),
        ("function", 1.5),
        ("class", 1.0),
        ("debug", 2.0),
        ("implement", 1.5),
        ("refactor", 2.0),
        ("optimize", 1.5),
        ("algorithm", 2.0),
        ("data structure", 2.0),
        ("api", 1.5),
        ("endpoint", 1.5),
        ("database", 1.5),
        ("sql", 2.0),
        ("regex", 1.5),
        ("compile", 1.5),
        ("syntax", 1.5),
        ("error", 1.0),
        ("bug", 1.5),
        ("fix", 1.0),
        ("code", 1.5),
        ("programming", 1.5),
        ("script", 1.0),
        ("library", 1.0),
        ("framework", 1.0),
        ("test", 1.0),
        ("unit test", 1.5),
    ];

    // Analysis patterns
    let analysis_patterns = [
        ("analyze", 2.0),
        ("compare", 1.5),
        ("evaluate", 1.5),
        ("review", 1.5),
        ("examine", 1.5),
        ("assess", 1.5),
        ("breakdown", 1.5),
        ("pros and cons", 2.0),
        ("tradeoffs", 2.0),
        ("trade-offs", 2.0),
        ("advantages", 1.0),
        ("disadvantages", 1.0),
        ("differences", 1.5),
        ("similarities", 1.5),
    ];

    // Reasoning patterns
    let reasoning_patterns = [
        ("why", 1.5),
        ("explain", 1.5),
        ("how does", 1.5),
        ("logic", 2.0),
        ("deduce", 2.0),
        ("because", 1.0),
        ("reason", 1.5),
        ("understand", 1.0),
        ("clarify", 1.0),
        ("what if", 1.5),
        ("implications", 1.5),
        ("consequence", 1.5),
    ];

    // Research patterns
    let research_patterns = [
        ("search", 2.0),
        ("find", 1.5),
        ("latest", 2.0),
        ("current", 1.5),
        ("news", 2.0),
        ("2024", 2.0),
        ("2025", 2.0),
        ("recent", 2.0),
        ("update", 1.0),
        ("today", 1.5),
        ("this week", 2.0),
        ("trending", 2.0),
        ("what happened", 2.0),
        ("who is", 1.5),
        ("where is", 1.5),
        ("when did", 1.5),
        ("statistics", 1.5),
        ("data about", 1.5),
        ("look up", 2.0),
        ("facts about", 1.5),
    ];

    // Creative patterns
    let creative_patterns = [
        ("write", 1.5),
        ("story", 2.0),
        ("brainstorm", 2.0),
        ("imagine", 2.0),
        ("creative", 2.0),
        ("ideas", 1.5),
        ("fiction", 2.0),
        ("poem", 2.0),
        ("poetry", 2.0),
        ("narrative", 2.0),
        ("character", 1.5),
        ("plot", 1.5),
        ("dialogue", 1.5),
        ("screenplay", 2.0),
        ("novel", 2.0),
        ("blog", 1.5),
        ("article", 1.0),
        ("content", 1.0),
        ("copywriting", 2.0),
        ("marketing", 1.5),
        ("slogan", 2.0),
        ("tagline", 2.0),
    ];

    // General patterns
    let general_patterns = [
        ("summarize", 1.5),
        ("translate", 2.0),
        ("list", 1.0),
        ("format", 1.0),
        ("convert", 1.0),
        ("rewrite", 1.0),
        ("simplify", 1.0),
        ("help", 0.5),
        ("what is", 1.0),
        ("define", 1.0),
        ("explain", 0.5), // Lower weight as it overlaps with reasoning
    ];

    // Image patterns
    let image_patterns = [
        ("image", 2.0),
        ("picture", 2.0),
        ("generate image", 3.0),
        ("create image", 3.0),
        ("dall-e", 3.0),
        ("dalle", 3.0),
        ("draw", 2.0),
        ("illustration", 2.0),
        ("visual", 1.5),
        ("photo", 1.5),
        ("artwork", 2.0),
    ];

    // Score each category
    let all_patterns: Vec<(TaskCategory, &[(&str, f32)])> = vec![
        (TaskCategory::Code, &code_patterns),
        (TaskCategory::Analysis, &analysis_patterns),
        (TaskCategory::Reasoning, &reasoning_patterns),
        (TaskCategory::Research, &research_patterns),
        (TaskCategory::Creative, &creative_patterns),
        (TaskCategory::General, &general_patterns),
        (TaskCategory::Image, &image_patterns),
    ];

    for (category, patterns) in all_patterns {
        for (keyword, weight) in patterns.iter() {
            if prompt_lower.contains(keyword) {
                *scores.get_mut(&category).unwrap() += weight;
                matched_keywords.push(keyword.to_string());
            }
        }
    }

    // Code block detection (high confidence for code)
    if prompt.contains("```") || prompt.contains("fn ") || prompt.contains("function ")
        || prompt.contains("def ") || prompt.contains("class ") {
        *scores.get_mut(&TaskCategory::Code).unwrap() += 3.0;
        matched_keywords.push("code_block".to_string());
    }

    // Length modifier (longer prompts tend to be more complex = analysis/reasoning)
    if prompt.len() > 500 {
        *scores.get_mut(&TaskCategory::Analysis).unwrap() += 1.0;
        *scores.get_mut(&TaskCategory::Reasoning).unwrap() += 0.5;
    }

    // Question detection
    if prompt.ends_with('?') {
        *scores.get_mut(&TaskCategory::Research).unwrap() += 0.5;
    }

    // Find the highest scoring category
    let mut max_score = 0.0f32;
    let mut max_category = TaskCategory::General;

    for (category, score) in &scores {
        if *score > max_score {
            max_score = *score;
            max_category = *category;
        }
    }

    // Calculate confidence (normalize to 0-1 range, cap at 0.99)
    let total_score: f32 = scores.values().sum();
    let confidence = if total_score > 0.0 {
        (max_score / total_score).min(0.99)
    } else {
        0.5 // Default confidence if no patterns matched
    };

    // Generate reasoning
    let reasoning = generate_reasoning(max_category, &matched_keywords, confidence);

    // Remove duplicates from matched keywords
    matched_keywords.sort();
    matched_keywords.dedup();

    TaskClassification {
        category: max_category,
        confidence,
        suggested_provider: max_category.suggested_provider(),
        reasoning,
        keywords_matched: matched_keywords,
    }
}

/// Generate human-readable reasoning for the classification
fn generate_reasoning(category: TaskCategory, keywords: &[String], confidence: f32) -> String {
    let confidence_level = if confidence > 0.8 {
        "High"
    } else if confidence > 0.5 {
        "Medium"
    } else {
        "Low"
    };

    let category_desc = match category {
        TaskCategory::Code => "code-related task",
        TaskCategory::Analysis => "analytical task",
        TaskCategory::Reasoning => "reasoning/explanation task",
        TaskCategory::Research => "research/current information task",
        TaskCategory::Creative => "creative writing task",
        TaskCategory::General => "general utility task",
        TaskCategory::Image => "image generation task",
    };

    let provider_reason = match category {
        TaskCategory::Code => "Claude excels at code generation and debugging",
        TaskCategory::Analysis => "Claude provides thorough analytical breakdowns",
        TaskCategory::Reasoning => "Claude offers detailed logical explanations",
        TaskCategory::Research => "Perplexity has real-time web search capabilities",
        TaskCategory::Creative => "ChatGPT is strong at creative content generation",
        TaskCategory::General => "ChatGPT handles general tasks efficiently",
        TaskCategory::Image => "ChatGPT has DALL-E integration for image generation",
    };

    if keywords.is_empty() {
        format!(
            "{} confidence: Classified as {} (default). {}.",
            confidence_level, category_desc, provider_reason
        )
    } else {
        let top_keywords: Vec<&String> = keywords.iter().take(3).collect();
        format!(
            "{} confidence: Detected {} based on keywords: {}. {}.",
            confidence_level,
            category_desc,
            top_keywords.iter().map(|k| format!("'{}'", k)).collect::<Vec<_>>().join(", "),
            provider_reason
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_code_classification() {
        let result = classify_task("Write a Rust function to parse JSON");
        assert_eq!(result.category, TaskCategory::Code);
        assert_eq!(result.suggested_provider, CloudProvider::Claude);
    }

    #[test]
    fn test_research_classification() {
        let result = classify_task("What are the latest news about AI in 2025?");
        assert_eq!(result.category, TaskCategory::Research);
        assert_eq!(result.suggested_provider, CloudProvider::Perplexity);
    }

    #[test]
    fn test_creative_classification() {
        let result = classify_task("Write a short story about a robot");
        assert_eq!(result.category, TaskCategory::Creative);
        assert_eq!(result.suggested_provider, CloudProvider::ChatGPT);
    }

    #[test]
    fn test_image_classification() {
        let result = classify_task("Generate an image of a sunset over mountains");
        assert_eq!(result.category, TaskCategory::Image);
        assert_eq!(result.suggested_provider, CloudProvider::ChatGPT);
    }
}
