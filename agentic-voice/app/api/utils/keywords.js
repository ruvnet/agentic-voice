const keywords = {
  // Add broad trigger keywords or phrases here
  "weather": ["weather", "temperature", "forecast", "climate"],
  "news": ["news", "headlines", "current events", "breaking news"],
  "sports": ["sports", "game", "score", "team"],
  "finance": ["stock", "market", "investment", "finance", "economy"],
  "technology": ["technology", "tech", "gadget", "innovation"],
  "entertainment": ["movie", "music", "entertainment", "show", "concert"],
  "health": ["health", "wellness", "medicine", "fitness"],
  "travel": ["travel", "vacation", "trip", "destination"],
  "food": ["food", "recipe", "cuisine", "restaurant"],
  "education": ["education", "learning", "school", "course"],
  "ai": ["ai", "artificial intelligence", "machine learning", "deep learning"],
  "developer": ["developer", "programming", "coding", "software", "github", "npm", "python", "javascript"],
};

/**
 * Extract keywords from user messages.
 * @param {Array} messages - Array of user messages.
 * @returns {Array} - Array of extracted keywords.
 */
function extractKeywords(messages) {
  const extractedKeywords = [];
  const messageContent = messages.map(message => message.content.toLowerCase()).join(' ');

  for (const [category, words] of Object.entries(keywords)) {
    words.forEach(word => {
      if (messageContent.includes(word)) {
        extractedKeywords.push(category);
      }
    });
  }

  return extractedKeywords;
}

module.exports = {
  keywords,
  extractKeywords
};
