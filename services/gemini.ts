import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateDailyEvent = async (day: number, reputation: number, lang: Language = 'ko') => {
  const client = getClient();
  if (!client) return null;

  const languageName = lang === 'ko' ? 'Korean' : 'English';

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are the Game Master for a "Bungeoppang Tycoon" game.
        It is Day ${day}. Current Reputation: ${reputation}.
        Generate a random daily event in JSON format.
        The event should be something that happens in a Korean street food context (weather, festivals, local news).
        
        **IMPORTANT: Provide the Title and Description in ${languageName}.**

        Fields:
        - title: Short title
        - description: 1 sentence description.
        - effect: One of ["NORMAL", "RUSH", "SLOW", "RICH"]
          - RUSH: More customers
          - SLOW: Fewer customers
          - RICH: Customers pay more/tip
          - NORMAL: No special effect
        
        Return ONLY the JSON.
      `,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Event Error:", error);
    // Fallback handled in App.tsx via translations, returning null here is fine or we can return a neutral object
    return null;
  }
};

export const generateDayReview = async (
  day: number,
  served: number,
  burnt: number,
  earned: number,
  lang: Language = 'ko'
) => {
  const client = getClient();
  if (!client) return null;

  const languageName = lang === 'ko' ? 'Korean' : 'English';

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Write a short, fun customer review or diary entry for a Bungeoppang stall owner.
        Day: ${day}
        Served: ${served} customers
        Burnt Food: ${burnt} items
        Money Earned: ${earned} KRW
        
        If burnt > 5, the review should be complaining about the smell.
        If served > 20, the review should be raving about the popularity.
        Keep it under 150 characters.
        
        **IMPORTANT: Write the review in ${languageName}.**
      `,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Review Error:", error);
    return null;
  }
};
