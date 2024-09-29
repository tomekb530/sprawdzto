const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLEAPI_KEY);
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },

];

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings});
class Gemini {
    async getResponse(prompt) {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}

module.exports = Gemini;