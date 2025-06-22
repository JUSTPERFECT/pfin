import { EXPENSE_CATEGORIES } from '../../../shared/constants/categories';

export class TransactionCategorizer {
  private static readonly keywordMappings: Record<string, string[]> = {
    food: [
      'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast',
      'food', 'pizza', 'burger', 'kitchen', 'meal', 'snack',
      'grocery', 'supermarket', 'market', 'fresh', 'fruits',
      'vegetables', 'meat', 'dairy', 'bread'
    ],
    transport: [
      'uber', 'ola', 'taxi', 'bus', 'metro', 'train', 'flight',
      'fuel', 'petrol', 'diesel', 'gas', 'parking', 'toll',
      'auto', 'rickshaw', 'cab', 'transport', 'travel'
    ],
    shopping: [
      'amazon', 'flipkart', 'myntra', 'shopping', 'mall', 'store',
      'clothes', 'fashion', 'shoes', 'bag', 'electronics',
      'mobile', 'laptop', 'gadget', 'purchase', 'buy'
    ],
    entertainment: [
      'movie', 'cinema', 'theatre', 'netflix', 'spotify', 'game',
      'entertainment', 'fun', 'party', 'club', 'bar', 'concert',
      'music', 'book', 'magazine', 'subscription'
    ],
    bills: [
      'electricity', 'water', 'gas', 'internet', 'mobile', 'phone',
      'bill', 'utility', 'maintenance', 'rent', 'loan', 'emi',
      'insurance', 'premium', 'subscription'
    ],
    health: [
      'hospital', 'doctor', 'medicine', 'pharmacy', 'medical',
      'health', 'clinic', 'dentist', 'checkup', 'treatment',
      'therapy', 'gym', 'fitness', 'yoga', 'wellness'
    ],
  };

  static suggestCategory(description: string, amount?: number): string {
    const normalizedDescription = description.toLowerCase().trim();
    
    // Check for keyword matches
    for (const [category, keywords] of Object.entries(this.keywordMappings)) {
      if (keywords.some(keyword => normalizedDescription.includes(keyword))) {
        return category;
      }
    }

    // Amount-based suggestions
    if (amount) {
      if (amount < 100) {
        return 'food'; // Small amounts often food/snacks
      } else if (amount > 10000) {
        return 'shopping'; // Large amounts often shopping/electronics
      }
    }

    return 'other'; // Default category
  }

  static getConfidenceScore(description: string, suggestedCategory: string): number {
    const normalizedDescription = description.toLowerCase().trim();
    const keywords = this.keywordMappings[suggestedCategory] || [];
    
    if (keywords.length === 0) return 0.1; // Low confidence for 'other'
    
    const matchingKeywords = keywords.filter(keyword => 
      normalizedDescription.includes(keyword)
    );
    
    if (matchingKeywords.length === 0) return 0.1;
    
    // Calculate confidence based on matches and keyword specificity
    const baseConfidence = matchingKeywords.length / keywords.length;
    
    // Boost confidence for exact matches
    const hasExactMatch = keywords.some(keyword => 
      normalizedDescription === keyword || 
      normalizedDescription.includes(` ${keyword} `) ||
      normalizedDescription.startsWith(`${keyword} `) ||
      normalizedDescription.endsWith(` ${keyword}`)
    );
    
    return Math.min(0.95, baseConfidence + (hasExactMatch ? 0.3 : 0));
  }

  static getCategoryOptions(description: string, limit: number = 3): Array<{
    category: string;
    confidence: number;
  }> {
    const suggestions = EXPENSE_CATEGORIES.map(cat => ({
      category: cat.key,
      confidence: this.getConfidenceScore(description, cat.key),
    }));

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit)
      .filter(item => item.confidence > 0.1);
  }

  static addCustomKeywords(category: string, keywords: string[]): void {
    if (!this.keywordMappings[category]) {
      this.keywordMappings[category] = [];
    }
    
    keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (!this.keywordMappings[category].includes(normalizedKeyword)) {
        this.keywordMappings[category].push(normalizedKeyword);
      }
    });
  }

  static learnFromTransaction(description: string, actualCategory: string): void {
    // Extract potential keywords from the description
    const words = description.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Add relevant words as keywords for the category
    this.addCustomKeywords(actualCategory, words);
  }
}