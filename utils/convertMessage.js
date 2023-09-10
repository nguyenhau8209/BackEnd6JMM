const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config();
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_KEY_2,
});
const openai = new OpenAIApi(configuration);

const runPrompt = async (prompt) => {
  const rule = process.env.RULE;
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${prompt}. Parses the input sentence and returns the results in JSON format, _number is price of the product or action in sentence and _stringCode is just 1 in 6 codes after you analyze based on ${rule}: {"price": _number, "code": _stringCode}`,
    max_tokens: 2048,
    temperature: 1,
  });

  const parsableJSONresponse = response.data.choices[0].text;
  const parsedResponse = JSON.parse(parsableJSONresponse);
  return parsedResponse;
};

module.exports = runPrompt;
