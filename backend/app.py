from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Set OpenAI API key from environment
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json
    topic = data.get("topic")
    level = data.get("level")

    prompt = f"Explain '{topic}' to a {level}-level learner and create 3 multiple choice questions with answers."

    try:
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return jsonify({"response": completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
