from flask import Flask, render_template, request, jsonify
import openai
from apikey import APIKEY
from about import identity

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
         # If the response contains an image request, generate an image using DALL-E
        if ("image of") in user_message.lower():
            try:
                image_response = openai.Image.create(
                    model="dall-e-3",
                    prompt=user_message,
                    size="1024x1024",
                    quality="hd", #change to "standard" for less token utilisation
                    n=1,
                    style="natural",
                )# read https://platform.openai.com/docs/api-reference/images/create for reference
            
                return image_response.data[0].url
            
            except Exception as image_error:
                print(f"Error generating image: {image_error}")
                return 'Error: Unable to generate image'
        
        else:
            try:
                # Using API to generate completion
                response = openai.ChatCompletion.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": identity},
                    {"role": "user", "content": user_message}
                ])
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
        return jsonify({'status': 'success', 'message': 'Awaiting response...'})


@app.route('/reset_conversation', methods=['POST'])
def reset_conversation():
    global messages
    messages = []
    return jsonify({'status': 'success', 'message': 'Conversation reset'})


if __name__ == '__main__':
    app.run(debug=True)
