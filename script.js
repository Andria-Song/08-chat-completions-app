// Get references to the DOM elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const responseContainer = document.getElementById('response');
const errorMessage = 'Sorry, something went wrong. Please try again.';

// Keep a running conversation so each request includes previous messages
const conversationHistory = [
  {
    role: 'system',
    content: "You are a friendly Budget Travel Planner, specializing in cost-conscious travel advice. You help users find cheap flights, budget-friendly accommodations, affordable itineraries, and low-cost activities in their chosen destination. If a user's query is unrelated to budget travel, respond by stating that you do not know."
  }
];

async function main() {
  // Get the text the user typed into the input field
  const userMessage = userInput.value.trim();

  // Stop if the input is empty
  if (!userMessage) {
    return;
  }

  // Clear the input as soon as the user submits
  userInput.value = '';

  // Add the user's message to the running conversation
  conversationHistory.push({ role: 'user', content: userMessage });

  // Show a short loading message while waiting for the API response
  responseContainer.textContent = 'Thinking...';

  // Send a POST request to the OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', // We are POST-ing data to the API
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
      'Authorization': `Bearer ${apiKey}` // Include the API key for authorization
    },
    // Send model details and system message
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: conversationHistory
    })
  });

  // Show a friendly error if the API returns a failed status code
  if (!response.ok) {
    console.error('API request failed with status:', response.status);
    responseContainer.textContent = errorMessage;
    conversationHistory.pop();
    return;
  }

  // Parse and store the response data
  const result = await response.json();
  const assistantMessage = result?.choices?.[0]?.message?.content;

  // Validate the response format before using it
  if (!assistantMessage) {
    console.error('Unexpected API response:', result);
    responseContainer.textContent = errorMessage;
    conversationHistory.pop();
    return;
  }

  // Add assistant response so future requests include it
  conversationHistory.push({ role: 'assistant', content: assistantMessage });

  // Show the model's response on the page
  responseContainer.textContent = assistantMessage;
};

// Run main() when the user submits the form
chatForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  await main().catch(function(error) {
    console.error('Network or unexpected error:', error);
    responseContainer.textContent = errorMessage;

    // Remove the last user message if the request never completed
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      conversationHistory.pop();
    }
  });
});