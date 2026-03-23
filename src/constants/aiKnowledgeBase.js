export const AI_KNOWLEDGE_BASE = {
    greetings: [
        "Hello! I am Pote, your personal plant assistant. How can I help you today?",
        "Hi there! 🌱 Looking for plant care tips or have a question about your order?",
        "Welcome to Potea! I'm here to help you grow your green thumb. What's on your mind?",
    ],
    typing_indicators: [
        "Pote is thinking...",
        "Searching knowledge base...",
        "Consulting with our plant experts...",
    ],
    categories: {
        care: {
            keywords: ["care", "water", "light", "sun", "soil", "fertilizer", "grow", "dying", "brown"],
            general: "Most plants love bright, indirect light and a consistent watering schedule. Always check the top inch of soil before watering!",
            responses: {
                "Monstera": "Monstera Deliciosa loves bright indirect light and needs watering every 1-2 weeks. It also appreciates high humidity!",
                "Snake Plant": "The Snake Plant is nearly indestructible! It tolerates low light and only needs water when the soil is completely dry (every 3-4 weeks).",
                "ZZ Plant": "ZZ plants are perfect for beginners. They thrive in almost any light condition and only need water every few weeks.",
                "Peace Lily": "Peace Lilies will 'tell' you when they are thirsty by drooping their leaves. Give them a drink and they'll perk right back up!",
            }
        },
        shipping: {
            keywords: ["shipping", "delivery", "track", "order", "status", "arrive", "where"],
            responses: [
                "Standard shipping usually takes 3-5 business days. You can track your order in the 'My Orders' section!",
                "We take extra care in packaging our plants to ensure they arrive happy and healthy. 📦",
                "Once your order ships, you'll receive a tracking number via email and app notification.",
            ]
        },
        returns: {
            keywords: ["return", "refund", "broken", "dead", "damaged", "exchange"],
            responses: [
                "We offer a 30-day health guarantee! If your plant arrives damaged, please send us a photo and we'll send a replacement.",
                "Returns are easy! Just go to your order details and select 'Return Item'.",
            ]
        },
        fallback: [
            "That's a great question! I'm still learning about that. Would you like to speak with a human specialist?",
            "I'm not sure I understand. Could you try rephrasing that? I'm best at plant care and order info!",
            "I'm still a sprout in training! 🌱 Let me connect you with our support team if you need more help.",
        ]
    },
    quick_replies: [
        "Plant Care Tips",
        "Track my Order",
        "Shipping Info",
        "Return Policy",
        "Talk to Human",
    ]
};
