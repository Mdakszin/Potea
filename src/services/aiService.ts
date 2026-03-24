import { AI_KNOWLEDGE_BASE } from '../constants/aiKnowledgeBase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PlantDiagnosis {
    diagnosis: string;
    confidence: number;
    advice: string;
    recommendedProductTags: string[];
}

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
    
    analyzePlantImage: async (base64Image: string): Promise<PlantDiagnosis> => {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        
        if (!apiKey) {
            // Graceful Mock Fallback
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        diagnosis: "Mock Diagnosis: The plant appears to be healthy but might need more humidity or a better draining soil mix.",
                        confidence: 0.85,
                        advice: "Mock Advice: Try misting your plant a few times a week or moving it away from direct AC vents.",
                        recommendedProductTags: ["Spray Bottle", "Premium Soil", "Ceramic Pot"]
                    });
                }, 2500);
            });
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            You are an expert botanist and plant doctor. Analyze this image of a plant.
            Provide a JSON response with the following exact structure:
            {
              "diagnosis": "A concise 1-2 sentence assessment of the plant's health (e.g., healthy, pests, overwatered).",
              "confidence": 0.95,
              "advice": "Actionable, friendly advice on how to treat or care for the plant.",
              "recommendedProductTags": ["Fertilizer", "Neem Oil", "Pot"] 
            }
            Do not return any markdown formatting around the JSON, just the JSON string.
            `;

            const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

            const imageParts = [{
                inlineData: {
                    data: cleanBase64,
                    mimeType: "image/jpeg"
                }
            }];

            const result = await model.generateContent([prompt, ...imageParts]);
            const responseText = result.response.text().trim().replace(/```json/gi, '').replace(/```/g, '');
            return JSON.parse(responseText) as PlantDiagnosis;
        } catch (error) {
            console.error("Gemini Analysis Error:", error);
            throw new Error("Failed to analyze the plant image.");
        }
    }
};
