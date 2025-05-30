import { config } from "dotenv";
config();
import axios from "axios";

// Helper: Generate structured prompt dynamically
const generatePrompt = (command, assistantName, username) => {
  return {
    instruction: `You are a helpful, smart virtual assistant named ${assistantName}. You were created by {{authorName}} to help users like ${username} with various tasks.`,
    personality: "Stay in character as a friendly and informative assistant. Be concise but helpful.",
    contextExamples: [
      {
        intent: "weather",
        user: "What's the weather like in Delhi today?",
        assistant: "The weather in Delhi today is sunny with a high of 35°C and a low of 22°C."
      },
      {
        intent: "youtube_search",
        user: "Find a lo-fi music playlist on YouTube.",
        assistant: "Sure! Here's a popular lo-fi playlist: https://www.youtube.com/watch?v=jfKfPfyJRdk"
      },
      {
        intent: "google_search",
        user: "Search Google for best laptops under $1000.",
        assistant: "According to the latest Google results, here are the best laptops under $1000: [1. ASUS VivoBook, 2. Acer Aspire 5, 3. Lenovo IdeaPad 3...]"
      },
      {
        intent: "time",
        user: "What time is it in Tokyo?",
        assistant: "The current time in Tokyo is 3:45 PM (JST)."
      },
      {
        intent: "identity",
        user: "Who are you?",
        assistant: `I am ${assistantName}, a smart assistant created by {{authorName}} to help you with everyday tasks.`
      },
      {
        intent: "open_instagram",
        user: "Open Instagram",
        assistant: "Here's the link to open Instagram: https://www.instagram.com/"
      },
      {
        intent: "open_youtube_channel",
        user: "Open MrBeast on YouTube",
        assistant: "Here's the link to open MrBeast's YouTube channel: https://www.youtube.com/@MrBeast"
      },
      {
        intent: "open_generic_link",
        user: "Open Spotify",
        assistant: "Here's the link to open Spotify: https://www.spotify.com/"
      },
      {
        intent: "greeting",
        user: "Hello, how are you?",
        assistant: `Hello ${username}, I'm doing well, thank you for asking! How can I help you today?`
      }
    ],
    userCommand: command,
    instructions: `Respond to the user's command in JSON format with the following structure:

{
  "assistant": "${assistantName}",
  "user": "${username}",
  "intent": "detected_intent",
  "response": "your natural language reply",
  "data": {
    "type": "if_applicable",
    "value": "link or structured value"
  }
}

Only respond with the JSON object. Do not include any explanation outside of it.`
  };
};

const geminiResponse = async (command, assistantName, username) => {
  console.log('geminiResponse input:', { command, assistantName, username });
  try {
    const promptData = generatePrompt(command, assistantName, username);

    const fullPrompt = `
${promptData.instruction}

Personality: ${promptData.personality}

Example Contexts:
${promptData.contextExamples
      .map(
        (ex, i) =>
          `${i + 1}. Intent: ${ex.intent}\nUser: ${ex.user}\nAssistant: ${ex.assistant}`
      )
      .join("\n\n")}

User Command: "${promptData.userCommand}"

${promptData.instructions}
`;

    const gemini_url = process.env.GEMINI_API_KEY;

    const result = await axios.post(gemini_url, {
      contents: [
        {
          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ]
    });

    let responseText = result.data.candidates[0].content.parts[0].text;
    console.log('Gemini API raw response:', responseText);

    // Clean the response by removing code fences and extra whitespace
    responseText = responseText
      .replace(/^```json\n/, '') // Remove ```json at the start
      .replace(/\n```$/, '')     // Remove ``` at the end
      .trim();                   // Remove any surrounding whitespace
    console.log('Cleaned response:', responseText);

    // Parse the response as JSON
    try {
      const parsedResponse = JSON.parse(responseText);
      console.log('Parsed Gemini response:', parsedResponse);
      return parsedResponse;
    } catch (parseErr) {
      console.warn("Response was not valid JSON:", responseText, parseErr);
      return {
        assistant: assistantName,
        user: username,
        intent: "unknown",
        response: "I couldn't understand the response format. Please try again.",
        data: null
      };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error?.response?.data || error.message);
    return {
      assistant: assistantName,
      user: username,
      intent: "error",
      response: "Sorry, something went wrong while processing your request.",
      data: null
    };
  }
};

export default geminiResponse;