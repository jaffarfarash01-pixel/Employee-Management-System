
require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: "Reply with exactly: OpenAI connection successful",
      max_output_tokens: 30,
    });

    console.log("OpenAI response:", response.output_text);
  } catch (error) {
    console.error("OpenAI test failed:", error.message);
  }
}

testOpenAI();
