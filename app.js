// Paste your Gemini API key right here inside the quotes for instant live connection:
const GEMINI_API_KEY = "AQ.Ab8RN6Iyw9IAby8iP2Dhc3gj8xvUmTBNeBGegKDLWvyBHiqy7w"; 

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
    resultDiv.innerText = "✨ Generating your assignment with AI...";

    let finalPrompt = promptText;
    if (isParaphrased) {
        finalPrompt = "Rewrite and paraphrase the following text heavily to ensure it bypasses AI detectors and plagiarism checkers, keeping it formal academic: " + promptText;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerText = "API Error: " + data.error.message;
            return;
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        resultDiv.innerText = aiResponse;
    } catch (error) {
        resultDiv.innerText = "Error connecting to AI. Please check your network.";
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
        link.download = 'assigno-assignment.docx';
        link.click();
        
        // Lock the workspace
        document.getElementById('resultText').setAttribute('contenteditable', 'false');
        document.getElementById('generateBtn').disabled = true;
        alert('Workspace locked successfully!');
    }
});
