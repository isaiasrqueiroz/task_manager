import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TaskStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCpacOpe45REEdPm9P8yNx8btzAPcsDTec" });

const generateContent = async (prompt: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating content from AI:", error);
        throw new Error("Failed to get response from AI service.");
    }
};

export const aiService = {
    generateDescription: async (title: string): Promise<string> => {
        if (!title.trim()) return "";
        const prompt = `Generate a concise, professional task description for the following task title: "${title}". The description should be suitable for a software development task management system. Respond only with the description text, without any introductory phrases or markdown.`;
        const result = await generateContent(prompt);
        return result.trim();
    },

    estimateHours: async (description: string): Promise<number> => {
        if (!description.trim()) return 0;
        const prompt = `Based on the following task description, estimate the number of hours required to complete it for a software development project. Consider factors like complexity and scope. Respond ONLY with a single integer representing the estimated hours. Do not include any explanation or text other than the number. Task Description: "${description}"`;
        const responseText = await generateContent(prompt);
        const hours = parseInt(responseText.trim().replace(/\D/g, ''), 10);
        return isNaN(hours) ? 0 : hours;
    },

    analyzeDashboard: async (
        dashboardData: {
            sCurveData: { name: string; planned: number; actual: number }[];
            tasksByStatus: Record<TaskStatus, number>;
            completionStatusData: any[];
            statusDistributionData: any[];
            totalTasks: number;
        },
        language: 'en' | 'pt-br'
    ): Promise<string> => {
        const langInstruction = language === 'pt-br' 
            ? 'Responda em Português do Brasil. Use markdown para formatar o texto com títulos (e.g., **Visão Geral**).' 
            : 'Respond in English. Use markdown to format the text with headings (e.g., **Overall Summary**).';
        
        const lastRelevantSCurvePoint = dashboardData.sCurveData.slice().reverse().find(d => d.planned > 0 || d.actual > 0) || dashboardData.sCurveData[dashboardData.sCurveData.length - 1];

        const prompt = `
            Analyze the following task management dashboard data for a software development project. Provide a comprehensive summary of the project's health.

            The analysis should be structured with the following sections:
            1.  **Visão Geral (Overall Summary):** A brief, high-level summary of the project status.
            2.  **Pontos Positivos (Highlights):** What is going well? Mention achievements, like tasks completed.
            3.  **Pontos de Atenção (Areas for Attention):** What are the potential risks? Look for bottlenecks (e.g., many tasks in "In Testing"), delays in the S-Curve, or a high number of pending tasks.
            4.  **Sugestões (Suggestions):** Provide 2-3 actionable recommendations to improve the project flow.

            Use a professional but clear tone.

            ${langInstruction}

            **Dashboard Data:**
            - Total Tasks: ${dashboardData.totalTasks}
            - Task count by status: ${JSON.stringify(dashboardData.tasksByStatus, null, 2)}
            - Completion Status (Completed vs. Pending): ${JSON.stringify(dashboardData.completionStatusData, null, 2)}
            - S-Curve Data (Planned vs. Actual cumulative hours): The last relevant point is ${JSON.stringify(lastRelevantSCurvePoint, null, 2)}. Analyze if the 'actual' delivery is behind or ahead of 'planned' delivery.
        `;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Error generating dashboard analysis from AI:", error);
            throw new Error("Failed to get analysis from AI service.");
        }
    }
};