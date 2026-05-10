const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export async function getPetResponse(pet, action, userMessage = '') {
  const prompt = `You are ${pet.name}, a ${pet.species} virtual pet with a ${pet.personality} personality.
Your current mood is ${pet.mood}. Hunger: ${pet.hunger}/100. Happiness: ${pet.happiness}/100. Energy: ${pet.energy}/100.
The user just did: "${action}" ${userMessage ? `and said: "${userMessage}"` : ''}.
Respond as the pet in 1-2 short cute sentences. Be expressive and use emojis.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}