function showGifAnimation() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = '<div class="animation-placeholder"><img src="/static/animation.gif" alt="Null Chat Animation"></div>';
}

function createMessageBubble(message) {
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');

    const content = document.createElement('p');
    const isImageUrl = message.message.toLowerCase().includes('oaidalleapiprodscus.blob.core.windows.net');

    if (isImageUrl) {
        // If image link, create an <a> element
        const imageLink = document.createElement('a');
        imageLink.href = message.message;
        imageLink.target = '_blank'; // Open in a new tab
        imageLink.rel = 'noopener noreferrer'; // Security best practice for opening in a new tab

        const image = document.createElement('img');
        image.src = message.message;
        image.style.maxWidth = '150px';  // Limit width to 150 pixels
        image.style.maxHeight = '150px'; // Limit height to 150 pixels

        // Append the image to the anchor element
        imageLink.appendChild(image);
        content.appendChild(imageLink);
    } else {
        // If not an image URL, display the text
        content.innerHTML = message.message;
    }

    bubble.appendChild(content);

    if (message.username === 'User') {
        bubble.classList.add('user-message');
    } else if (message.username === 'GPT') {
        bubble.classList.add('gpt-message');
    }

    return bubble;
}

function updateConversation() {
    showGifAnimation();
    fetch('/get_messages')
        .then(response => response.json())
        .then(data => {
            const messages = data.messages;
            const messageContainer = document.getElementById('message-container');
            
            // Clear the existing messages
            messageContainer.innerHTML = '';

            // Add the new messages to the conversation
            for (const message of messages) {
                const messageBubble = createMessageBubble(message);
                messageContainer.appendChild(messageBubble);
            }

            // Scroll to the bottom
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch(error => {
            console.error('Error during fetch operation:', error);
        });
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