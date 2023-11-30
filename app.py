from flask import Flask, render_template, request, jsonify
import openai
from apikey import APIKEY

openai.api_key = APIKEY  # Set OpenAI API key

app = Flask(__name__)

messages = []

@app.route('/')
def index():
    return render_template('index.html', messages=messages)

@app.route('/send_message', methods=['POST'])
def send_message():
    user_message = request.form.get('message')
    
    if user_message:
        messages.append({'username': 'User', 'message': user_message})

        # Get GPT response
        gpt_response = get_gpt_response(user_message)
        messages.append({'username': 'GPT', 'message': gpt_response})

        return jsonify({'status': 'success', 'messages': messages})
    else:
        return jsonify({'status': 'error', 'message': 'Invalid data'})

@app.route('/get_messages', methods=['GET'])
def get_messages():
    # Return the entire conversation history
    return jsonify({'status': 'success', 'messages': messages})

def get_gpt_response(user_message):
    try:
        # Using API to generate completion
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a chat-based AI helper."},
                {"role": "user", "content": user_message}
            ]
        )

        return response.choices[0].message['content']
    except Exception as e:
        print(f"Error generating GPT response: {e}")
        return 'Error: Unable to get response from GPT'

@app.route('/get_answer', methods=['GET'])
def get_answer():
    if messages:
        latest_gpt_response = messages[-1]['message']
        return jsonify({'status': 'success', 'message': latest_gpt_response})
    else:
        return jsonify({'status': 'error', 'message': 'No messages available'})

@app.route('/reset_conversation', methods=['POST'])
def reset_conversation():
    global messages
    messages = []
    return jsonify({'status': 'success', 'message': 'Conversation reset'})


if __name__ == '__main__':
    app.run(debug=True)
