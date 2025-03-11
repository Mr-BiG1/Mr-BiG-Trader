require('dotenv').config();

async function askOpenAI(prompt) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    return data.choices?.[0]?.message?.content || "No response from AI.";
  } catch (error) {
    console.error("OpenAI fetch error:", error.message);
    return "OpenAI request failed.";
  }
}

module.exports = { askOpenAI };
