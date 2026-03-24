import { AI_KNOWLEDGE_BASE } from '../constants/aiKnowledgeBase';

const processMessage = async (text: string): Promise<string> => {
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
        const res = categories.shipping.responses;
        return res[Math.floor(Math.random() * res.length)];
    }

    // 3. Returns Check
    if (categories.returns.keywords.some(k => input.includes(k))) {
        const res = categories.returns.responses;
        return res[Math.floor(Math.random() * res.length)];
    }

    // Default Fallback
    const fallback = AI_KNOWLEDGE_BASE.categories.fallback;
    return fallback[Math.floor(Math.random() * fallback.length)];
};

export const aiService = {
    generateResponse: processMessage,
    getGreetings: (): string => {
        const greetings = AI_KNOWLEDGE_BASE.greetings;
        return greetings[Math.floor(Math.random() * greetings.length)];
    },
    getQuickReplies: (): string[] => AI_KNOWLEDGE_BASE.quick_replies,
};
