from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv
import re
import traceback
import markdown

# Load environment variables
load_dotenv()

app = Flask(__name__)
# CORS(app)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://studyspark-frontend.onrender.com"
        ]
    }
})

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
        # explanation = explanation_response.text
        explanation = markdown.markdown(explanation_response.text)

        # Generate quiz
        quiz_prompt = f"Create 3 multiple choice quiz questions about {topic} for a {level}. Format: Q: [question]\nA: [option]\nB: [option]\nC: [option]\nD: [option]\nCorrect: [letter]"
        quiz_response = model.generate_content(quiz_prompt)
        quiz_text = quiz_response.text
        # quiz = parse_quiz(quiz_text)

        return jsonify({
            "success": True,
            "topic": topic,
            "level": level,
            "explanation": explanation,
            "questions": parse_quiz(quiz_text)  # Or parse as needed
        })

    # except Exception as e:
    #     print(f"Error: {str(e)}")
    #     return jsonify({"error": f"Failed to generate content: {str(e)}"}), 500
    except Exception as e:
        traceback.print_exc()  # This gives detailed error in terminal
        return jsonify({"error": f"Failed to generate content: {str(e)}"}), 500


def parse_quiz(quiz_text):
    # Split into questions
    question_blocks = re.split(r'\n(?=Q: )', quiz_text.strip())
    quiz = []
    for block in question_blocks:
        q_match = re.search(r'Q:\s*(.*)', block)
        a_match = re.search(r'A:\s*(.*)', block)
        b_match = re.search(r'B:\s*(.*)', block)
        c_match = re.search(r'C:\s*(.*)', block)
        d_match = re.search(r'D:\s*(.*)', block)
        correct_match = re.search(r'Correct:\s*([A-D])', block)
        if q_match and a_match and b_match and c_match and d_match and correct_match:
            quiz.append({
                "question": q_match.group(1).strip(),
                "options": {
                    "A": a_match.group(1).strip(),
                    "B": b_match.group(1).strip(),
                    "C": c_match.group(1).strip(),
                    "D": d_match.group(1).strip(),
                },
                "correct": correct_match.group(1).strip()
            })
    return quiz



if __name__ == '__main__':
    port = int(os.environ.get("PORT", 3001))
    app.run(host='0.0.0.0', port=port, debug=True)
