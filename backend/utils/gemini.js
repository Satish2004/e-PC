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
            "translatedHinglish": "The original complaint text strictly translated and converted into Hinglish (Hindi language written in English alphabet, e.g., 'Mera paani road par beh raha hai'). You MUST translate EVERY language (including pure English, pure Hindi, etc.) into Hinglish.",
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
        return { enhancedText: text, translatedHinglish: text, category: 'General', urgency: 'Low' };
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
        const prompt = `Summarize the following government scheme in very simple, casual, easy-to-understand Hinglish (Hindi language written in English alphabet).
        
        CRITICAL NARRATIVE RULES:
        1. HUMAN TONE: Explain this scheme directly to a citizen in natural, colloquial Hinglish.
        2. STRICT PROHIBITION: DO NOT use ANY introductory words. NEVER start with "Zarur", "Haan", "Theek hai". START DIRECTLY WITH THE HTML STRUCTURE!
        3. NO Markdown formatting (NO asterisks *, NO hashtags #, NO bold **).
        4. MANDATORY STRUCTURE: You MUST format your response EXACTLY using the following HTML structure:
        
        <h3 class="text-xl font-bold mb-2 text-indigo-400">[Scheme Name or Header in Hinglish]</h3>
        <p class="mb-4 text-slate-200">[A short 2-3 line simple explanation of what this scheme is]</p>
        
        <h4 class="text-lg font-semibold mt-4 mb-2 text-blue-300">Kise Fayda Milega? (Eligibility)</h4>
        <ul class="list-disc pl-5 mb-4 text-slate-300 space-y-1">
            <li>[Point 1]</li>
            <li>[Point 2]</li>
        </ul>
        
        <h4 class="text-lg font-semibold mt-4 mb-2 text-emerald-300">Kya Fayda Hoga? (Benefits)</h4>
        <ul class="list-disc pl-5 mb-3 text-slate-300 space-y-1">
            <li>[Benefit 1]</li>
            <li>[Benefit 2]</li>
        </ul>
        
        Text to summarize:\n${schemesText}`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini AI Error (Schemes):", error);
        return "";
    }
};

export const translateToHindi = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `Strictly translate the following text into standard, pure Hindi language written in Devanagari script. 
        CRITICAL RULES:
        1. Do not summarize or alter the meaning.
        2. Do not write in English or Hinglish.
        3. DO NOT use any markdown formatting.
        4. STRICT PROHIBITION: DO NOT use ANY introductory words. NEVER start with "ज़रूर", "हाँ", "मैं अनुवाद कर सकता हूँ", "यहाँ अनुवाद है". START DIRECTLY WITH THE TRANSLATED TEXT ONLY.
        
        Text: "${text}"`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini AI Error (Translate Hindi):", error);
        return text;
    }
};