document.addEventListener("DOMContentLoaded", () => {
  const API_KEY_GEMINI = "API Key is hided";
  const API_KEY_GOOGLE = "API Key is hided";
  const CX = "87c7fcf5de159496f";

  const inputField = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  sendButton.addEventListener("click", sendMessage);

  async function sendMessage() {
    const userInput = inputField.value.trim();
    if (!userInput) return;

    displayMessage(userInput, "user-message");
    inputField.value = "";

    // Show "🤔 Responding..." in chat
    const thinkingMsg = displayMessage("🤔 Responding...", "bot-message", true);

    const keywords = ["weather", "temperature", "winner", "score", "news", "today", "time", "date"];
    const isRealTime = keywords.some(keyword => userInput.toLowerCase().includes(keyword));

    // Check if the query is related to the date or time
    if (userInput.toLowerCase().includes("date") || userInput.toLowerCase().includes("today")) {
      // Handle date query
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString('en-US', {
        weekday: 'long',  // E.g., "Monday"
        year: 'numeric',  // E.g., "2025"
        month: 'long',    // E.g., "April"
        day: 'numeric'    // E.g., "15"
      });

      thinkingMsg.remove();
      displayMessage(`Today is: ${formattedDate}`, "bot-message");
    } else if (userInput.toLowerCase().includes("time")) {
      // Handle time query
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleString('en-US', {
        hour: 'numeric',  
        minute: 'numeric',
        second: 'numeric',
        hour12: true  // 12-hour format
      });

      thinkingMsg.remove();
      displayMessage(`Current time is: ${formattedTime}`, "bot-message");
    } else if (isRealTime) {
      // For other real-time queries, proceed with Google Custom Search API or Gemini
      try {
        const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${API_KEY_GOOGLE}&cx=${CX}&q=${encodeURIComponent(userInput)}`);
        const data = await res.json();
        thinkingMsg.remove();

        if (data.items && data.items.length > 0) {
          const result = data.items[0];
          const reply = `🔎 **${result.title}**\n${result.snippet}\n🌐 [Visit](${result.link})`;
          displayMessage(reply, "bot-message");
        } else {
          displayMessage("🤖 No relevant info found.", "bot-message");
        }
      } catch (error) {
        thinkingMsg.remove();
        console.error("Search error:", error);
        displayMessage("⚠ Could not fetch real-time data.", "bot-message");
      }
    } else {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY_GEMINI}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userInput }] } ]
          })
        });

        const data = await response.json();
        thinkingMsg.remove();

        const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 Sorry, I couldn't understand that.";
        displayMessage(botReply, "bot-message");
      } catch (error) {
        thinkingMsg.remove();
        console.error("Gemini error:", error);
        displayMessage("⚠ Error: Could not connect to Gemini API.", "bot-message");
      }
    }
  }

  function displayMessage(text, className, returnElement = false) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.className = className;
    messageDiv.innerHTML = convertMarkdownToHTML(text);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return returnElement ? messageDiv : null;
  }

  function convertMarkdownToHTML(markdown) {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/\n\* (.*)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>')
      .replace(/\[([^\]]+)]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
  }
});

