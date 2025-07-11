function openAI() {
    document.getElementById('aiBox').style.display = 'block';
}

function runAI() {
    const input = document.getElementById('aiInput').value;
    const responseBox = document.getElementById('aiResponse');

    if (!input.trim()) {
        responseBox.innerHTML = '❌ יש להזין פקודה';
        return;
    }

    // Placeholder: simulated AI response
    responseBox.innerHTML = '🤖 ה-AI אומר: "' + input + '" זו בקשה מעניינת! נבצע שיפור מתאים.';
}

