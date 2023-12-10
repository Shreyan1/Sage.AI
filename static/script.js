function showGifAnimation() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = '<div class="animation-placeholder"><img src="/static/animation.gif" alt="Null Chat Animation"></div>';
}

function createMessageBubble(message) {
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');

    const content = document.createElement('p');
    content.innerHTML = message.message; // Use innerHTML to parse HTML content

    bubble.appendChild(content);

    if (message.username === 'User') {
        bubble.classList.add('user-message');
    } else if (message.username === 'GPT') {
        bubble.classList.add('gpt-message');
    }
    return bubble;
}

// Function to update the conversation dynamically
function updateConversation() {

    showGifAnimation();
    fetch('/get_messages')
        .then(response => response.json())
        .then(data => {
            // Process the JSON data and update the conversation
            const messages = data.messages;

            // Clear the existing messages
            const messageContainer = document.getElementById('message-container');
            messageContainer.innerHTML = '';

            // Add the new messages to the conversation
            for (const message of messages) {
                const messageBubble = createMessageBubble(message);
                messageContainer.appendChild(messageBubble);
            }
        })
        .catch(error => {
            console.error('Error during fetch operation:', error);
        })
}

window.addEventListener('beforeunload', function() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = '';
});

window.addEventListener('unload', function() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = '';
});

document.getElementById('message-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const message = document.getElementById('message').value;
    const url = `http://127.0.0.1:5000/get_answer?message=${message}`;

    fetch(url, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('message-form').reset();
            updateConversation(); // Update the conversation with the new messages
        } else {
            alert(`Error: ${data.message}`);
        }
    });
});

document.getElementById('message-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const message = document.getElementById('message').value;

    fetch('/send_message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `message=${message}`,
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('message-form').reset();
            updateConversation();
        } else {
            alert(`Error: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error during fetch operation:', error);
    });
});

function resetConversation() {
    console.log('Resetting conversation...');
    fetch('/reset_conversation', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        showGifAnimation();
    })
    .catch(error => {
        console.error('Error during fetch operation:', error);
    });
}