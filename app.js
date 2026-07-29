// GENERATE ASSIGNMENT
document.getElementById('generateBtn').addEventListener('click', async () => {
    const promptText = document.getElementById('promptInput').value.trim();
    const isParaphrased = document.getElementById('paraphraseCheck').checked;

    if (!promptText) { alert("Please enter an assignment prompt!"); return; }

    if (currentUser.credits <= 0 && currentUser.role !== "admin") {
        document.getElementById('paywallModal').style.display = 'flex';
        return;
    }

    const outputArea = document.getElementById('outputArea');
    const resultDiv = document.getElementById('resultText');
    
    outputArea.style.display = 'block';
    resultDiv.innerText = "✍️ Writing response in handwritten exam style...";
    document.getElementById('paperTopicTitle').innerText = promptText.substring(0, 35) + "...";
    document.getElementById('paperDate').innerText = new Date().toLocaleDateString();

    let finalPrompt = promptText;
    if (isParaphrased) {
        finalPrompt = "Provide a clean, formal academic assignment answer structured with headings and bullet points where necessary for: " + promptText;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: finalPrompt }]
                }]
            })
        });

        // Check if the response text is HTML (which happens if a host/proxy intercepts it)
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Intercepted response:", responseText);
            resultDiv.innerText = "Hosting/Network Interception Error: The request was blocked or redirected by a login wall.";
            return;
        }
        
        if (data.error) {
            resultDiv.innerText = "API Error: " + data.error.message;
            return;
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        resultDiv.innerText = aiResponse;

        if (currentUser.role !== "admin") {
            currentUser.credits--;
            document.getElementById('creditCount').innerText = currentUser.credits;
        }

        userHistory.unshift({ title: promptText, date: new Date().toLocaleDateString(), text: aiResponse });
        updateHistoryUI();
        logAction(`User '${currentUser.username}' generated assignment.`);

    } catch (error) {
        resultDiv.innerText = "Network Error: Check browser console.";
        console.error(error);
    }
});
