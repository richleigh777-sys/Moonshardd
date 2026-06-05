
export interface BriefingResponse {
    summary: string;
    sentiment: 'Positive' | 'Neutral' | 'Frustrated';
    recommendation: string;
    keyThemes: string[];
}

export const getCustomerStrategicBriefing = async (customerName: string, history: string[]): Promise<BriefingResponse> => {
    try {
        const response = await fetch("/api/gemini/strategic-briefing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ customerName, history })
        });

        if (!response.ok) {
            throw new Error(`AI Gateway responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data as BriefingResponse;
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
