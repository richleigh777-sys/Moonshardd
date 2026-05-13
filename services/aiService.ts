
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BriefingResponse {
    summary: string;
    sentiment: 'Positive' | 'Neutral' | 'Frustrated';
    recommendation: string;
    keyThemes: string[];
}

export const getCustomerStrategicBriefing = async (customerName: string, history: string[]): Promise<BriefingResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `
                Analyze the following customer interaction history for ${customerName} and provide a strategic briefing for a sales agent.
                
                History:
                ${history.join('\n')}
                
                Focus on:
                1. A concise summary of their current situation.
                2. Sentiment analysis.
                3. A concrete recommendation for the next call.
                4. Key recurring themes or objections.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Frustrated'] },
                        recommendation: { type: Type.STRING },
                        keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['summary', 'sentiment', 'recommendation', 'keyThemes']
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text.trim());
        }
        throw new Error("Empty response from AI");
    } catch (error) {
        console.error("AI Briefing Error:", error);
        return {
            summary: "Unable to generate AI briefing at this moment.",
            sentiment: "Neutral",
            recommendation: "Review the interaction history manually before the next call.",
            keyThemes: ["Technical error"]
        };
    }
};
