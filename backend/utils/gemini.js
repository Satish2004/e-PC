import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeComplaint = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `Analyze the following complaint related to a village panchayat. You must respond with ONLY a valid, raw JSON object and nothing else. No markdown, no introductory text.
        Required JSON format:
        {
            "enhancedText": "A professional rewrite of the complaint.",
            "category": "Suitable category (e.g., Water, Electricity, Roads, Sanitation, Other)",
            "urgency": "Low, Medium, or High"
        }
        Complaint: "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let textResponse = response.text();
        
        // Robust JSON extraction to prevent 'Unexpected token' errors
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            textResponse = jsonMatch[0];
        }

        return JSON.parse(textResponse);
    } catch (error) {
        console.error("Gemini AI Error (Complaint):", error);
        return { enhancedText: text, category: 'General', urgency: 'Low' };
    }
};

export const chatWithGovtAI = async (promptMsg) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const systemInstruction = `You are an AI assistant for e-PC – Smart Digital Panchayat System. You help rural citizens with Panchayat services.
        
        CRITICAL RULES:
        - DO NOT USE STARS (*) anywhere in your response. 
        - DO NOT USE MARKDOWN.
        - Use <b>your text</b> for all IMPORTANT WORDS and HEADINGS. 
        - Use clear line breaks between sections.
        
        Response Format Example:
        <b>VILLAGE SCHEME UPDATE</b>
        Objective: To provide <b>clean water</b> to all residents.
        Benefits: 
        - <b>Health</b> improvements
        - <b>24/7</b> availability
        
        Always keep language simple and helpful.`;
        const result = await model.generateContent(`${systemInstruction}\nUser: ${promptMsg}`);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error (Chat):", error);
        return "Sorry, I am currently unavailable.";
    }
};

export const summarizeSchemes = async (schemesText) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `Summarize the following government scheme in simple, easy-to-understand Hindi for village citizens:\n${schemesText}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini AI Error (Schemes):", error);
        return "";
    }
};