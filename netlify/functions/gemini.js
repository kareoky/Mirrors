// This function acts as a secure backend proxy to the Google Gemini API.
// It reads the API key from Netlify's environment variables.

const fetch = require('node-fetch');

const API_KEY = process.env.API_KEY;
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-image:generateContent';

const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API_KEY environment variable is not set." }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { action } = body;

    let parts = [];
    let promptText = '';
    
    // --- Generate Action ---
    if (action === 'generate') {
      const { mirrorImage, decorImage, mirrorType, mirrorPlacement } = body;
      
      parts.push({ inlineData: { mimeType: mirrorImage.mimeType, data: mirrorImage.data }});

      promptText = `Important instructions: The exact shape, frame, and design of the mirror in the first image must be preserved. Do not change the mirror itself in any way. Your task is to change only the background and surroundings.\n\n`;
  
      if (mirrorPlacement === 'wall-mounted') {
        promptText += `Realistically place this mirror on a wall within a new, stylish, and modern interior decor. `;
      } else { // floor-standing
        promptText += `Realistically place this floor-standing mirror in a new, stylish, and modern interior decor. Ensure it is standing on the floor, perhaps leaning against a wall or on its own stand. `;
      }

      if (mirrorType === 'illuminated') {
        promptText += `The mirror is an illuminated (backlit) type. When placed in the new scene, it should appear to be on, with a soft, elegant glow emitting from its edges. `;
      } else if (mirrorType === 'touch-illuminated') {
        promptText += `The mirror is an illuminated type with a touch button. When placed in the new scene, it should appear to be on, with a soft, elegant glow. Make sure the touch button is visible and faintly lit. `;
      }

      promptText += `The room should look high-end, elegant, and well-lit. Create a beautiful and inspirational living space. The mirror should be the main focal point.`;

      if (decorImage) {
        parts.push({ inlineData: { mimeType: decorImage.mimeType, data: decorImage.data }});
        promptText = `Using the first image (a mirror) and the second image (a decor style reference), place the mirror into a new interior. This new decor should be heavily inspired by the style, color palette, and mood of the reference image. The final image should look elegant, modern, and professionally designed, with the mirror seamlessly integrated into the inspired decor.\n\n` + promptText;
      }

      parts.push({ text: promptText });
    
    // --- Edit Action ---
    } else if (action === 'edit') {
        const { baseImage, prompt } = body;
        parts.push({ inlineData: { mimeType: baseImage.mimeType, data: baseImage.data }});
        parts.push({ text: `Subtly modify the following image based on this instruction: "${prompt}". Maintain the overall composition and realism of the image.` });

    } else {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid action specified." }) };
    }

    const requestBody = {
        contents: [{ parts: parts }],
        generationConfig: {
            responseMimeType: "image/png"
        }
    };
    
    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        // Pass through the error from Gemini API
        return { statusCode: response.status, body: JSON.stringify({ error: errorData.error.message }) };
    }

    const data = await response.json();
    const generatedPart = data.candidates?.[0]?.content?.parts?.[0];

    if (generatedPart && generatedPart.inlineData) {
        const base64Image = generatedPart.inlineData.data;
        const mimeType = generatedPart.inlineData.mimeType;
        const dataUri = `data:${mimeType};base64,${base64Image}`;
        return {
            statusCode: 200,
            body: JSON.stringify({ image: dataUri }),
        };
    } else {
        throw new Error("Failed to generate image. No image part in response.");
    }

  } catch (error) {
    console.error('Proxy Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'An unexpected error occurred.' }) };
  }
};

module.exports = { handler };
