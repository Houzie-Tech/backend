import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

/**
 * Generates a compelling AI-powered real estate listing description.
 * @param listing - The property details for which the description is being generated.
 * @param favourites - User's favorite listings data (array of objects with full details).
 * @param history - User's saved search or visited listings data (array of objects with full details).
 * @returns A concise AI-generated description as a string.
 */
export async function generateAiDescription(
  listing: any,
  favourites: any[],
  history: any[],
): Promise<string> {
  // Constructing a detailed and structured prompt for better AI output
  const prompt = `
    You are a real estate expert. Generate a concise, engaging, and persuasive property description (less than 100 words) 
    for the following property details:

    - Property Details: ${JSON.stringify(listing, null, 2)}

    Consider these preferences based on the user's favorite listings and search/visited history:
    - User's Favorite Listings: ${
      favourites.length > 0
        ? favourites.map((fav) => JSON.stringify(fav, null, 2)).join('\n')
        : 'No favorites available'
    }
    - User's Search/Visited History: ${
      history.length > 0
        ? history.map((hist) => JSON.stringify(hist, null, 2)).join('\n')
        : 'No history available'
    }

    Ensure the description highlights key features of the property and appeals to the user's preferences based on their favorites and search history.
  `;

  try {
    // Call OpenAI's GPT model via AI SDK
    const response = await generateText({
      model: openai('gpt-4o-mini'), // Use appropriate model
      prompt,
      maxTokens: 300, // Limit tokens to ensure concise output
      temperature: 0.7, // Adjust creativity level
    });

    // Trim and return the generated text
    return response.text.trim();
  } catch (error) {
    console.error('Error generating AI description:', error);
    throw new Error('Failed to generate AI description');
  }
}
