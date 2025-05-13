from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

# Create a Flask app instance
app = Flask(__name__)
CORS(app)  # Allow frontend access

openai.api_key = "YOUR_OPENAI_API_KEY"  # Replace with your real key

@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json
    topic = data.get("topic")
    level = data.get("level")

    prompt = f"Explain '{topic}' to a {level}-level learner and create 3 multiple choice questions."

    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )

    return jsonify({"response": completion.choices[0].message.content})

if __name__ == "__main__":
    app.run(debug=True)