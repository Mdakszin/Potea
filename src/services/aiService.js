import { AI_KNOWLEDGE_BASE } from '../constants/aiKnowledgeBase';

const processMessage = async (text) => {
    const input = text.toLowerCase();
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

    // Check Categories
    const categories = AI_KNOWLEDGE_BASE.categories;

    // 1. Care Check
    if (categories.care.keywords.some(k => input.includes(k))) {
        for (const [plant, response] of Object.entries(categories.care.responses)) {
            if (input.includes(plant.toLowerCase())) return response;
        }
        return categories.care.general;
    }

    // 2. Shipping Check
    if (categories.shipping.keywords.some(k => input.includes(k))) {
        return categories.shipping.responses[Math.floor(Math.random() * categories.shipping.responses.length)];
    }

    // 3. Returns Check
    if (categories.returns.keywords.some(k => input.includes(k))) {
        return categories.returns.responses[Math.floor(Math.random() * categories.returns.responses.length)];
    }

    // Default Fallback
    return AI_KNOWLEDGE_BASE.categories.fallback[Math.floor(Math.random() * AI_KNOWLEDGE_BASE.categories.fallback.length)];
};

export const aiService = {
    generateResponse: processMessage,
    getGreetings: () => AI_KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * AI_KNOWLEDGE_BASE.greetings.length)],
    getQuickReplies: () => AI_KNOWLEDGE_BASE.quick_replies,
};
