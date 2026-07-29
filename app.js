const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE"; // Replace with your key from Step 1

document.getElementById('generateBtn').addEventListener('click', async () => {
    const promptText = document.getElementById('promptInput').value;
    const isParaphrased = document.getElementById('paraphraseCheck').checked;
    
    if (!promptText) {
        alert('Please enter an assignment prompt first!');
        return;
    }

    const outputArea = document.getElementById('outputArea');
    const resultDiv = document.getElementById('resultText');
    
    outputArea.style.display = 'block';
    resultDiv.innerText = "Generating your assignment using AI...";

    let finalPrompt = promptText;
    if (isParaphrased) {
        finalPrompt = "Rewrite and paraphrase the following text heavily to ensure it bypasses AI detectors and plagiarism checkers, keeping it academic: " + promptText;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        resultDiv.innerText = aiResponse;
    } catch (error) {
        resultDiv.innerText = "Error generating content. Please check your API key or try again.";
        console.error(error);
    }
});

// Download handler locking simulation
document.getElementById('downloadBtn').addEventListener('click', () => {
    const confirmDownload = confirm("Once you download this workspace, it will be locked and you can no longer edit it. Are you sure?");
    if (confirmDownload) {
        const text = document.getElementById('resultText').innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'assigno-assignment.txt';
        link.click();
        
        // Lock the workspace
        document.getElementById('resultText').setAttribute('contenteditable', 'false');
        document.getElementById('generateBtn').disabled = true;
        alert('Workspace locked successfully!');
    }
});