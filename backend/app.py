from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# List available models (add this temporarily)
print("Available Gemini models for your API key:")
for m in genai.list_models():
    print(m.name)

@app.route('/api/explain', methods=['POST'])
def explain_topic():
    try:
        data = request.json
        topic = data.get('topic', '')
        level = data.get('level', 'adult')

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        valid_levels = ['child', 'teen', 'adult']
        if level not in valid_levels:
            return jsonify({"error": "Level must be one of: child, teen, adult"}), 400

        # Create prompt
        level_prompts = {
            'child': f"Explain {topic} in a simple, fun way for a 5-12 year old. Use simple words, short sentences, and an analogy or example.",
            'teen': f"Explain {topic} for a teenager (13-17). Use clear language and relevant examples.",
            'adult': f"Explain {topic} in a comprehensive way for an adult learner. Include important details and context."
        }
        prompt = level_prompts[level]

        # Generate explanation
        model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
        explanation_response = model.generate_content(prompt)
        explanation = explanation_response.text

        # Generate quiz
        quiz_prompt = f"Create 3 multiple choice quiz questions about {topic} for a {level}. Format: Q: [question]\nA: [option]\nB: [option]\nC: [option]\nD: [option]\nCorrect: [letter]"
        quiz_response = model.generate_content(quiz_prompt)
        quiz_text = quiz_response.text

        return jsonify({
            "success": True,
            "topic": topic,
            "level": level,
            "explanation": explanation,
            "questions": quiz_text  # Or parse as needed
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to generate content: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True)