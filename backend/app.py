from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import openai
import json
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        # Get request data
        data = request.json
        study_content = data.get('studyContent', '')
        num_questions = data.get('numQuestions', 5)
        
        if not study_content:
            return jsonify({"error": "Study content is required"}), 400
        
        # Validate num_questions
        try:
            num_questions = int(num_questions)
            if num_questions < 1 or num_questions > 10:
                return jsonify({"error": "Number of questions must be between 1 and 10"}), 400
        except ValueError:
            return jsonify({"error": "Number of questions must be a valid integer"}), 400
        
        # Generate quiz using OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"You are an educational quiz generator. Create {num_questions} quiz questions based on the provided study content. Format each question with the question text, 4 multiple-choice options (A, B, C, D), and the correct answer. Each question should be formatted like this:\n\nQ: [Question text]\nA: [Option A]\nB: [Option B]\nC: [Option C]\nD: [Option D]\nCorrect: [Correct option letter]"},
                {"role": "user", "content": f"Generate {num_questions} quiz questions based on this content:\n\n{study_content}"}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        # Extract quiz questions from OpenAI response
        quiz_text = response.choices[0].message['content']
        questions = extract_questions(quiz_text)
        
        return jsonify({
            "success": True,
            "questions": questions
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500

def extract_questions(quiz_text):
    """
    Parse the OpenAI response to extract structured quiz questions
    """
    questions = []
    
    # Split by Q: to get individual questions
    question_blocks = re.split(r'Q:\s*', quiz_text)
    
    # Skip the first element if it's empty
    question_blocks = [block for block in question_blocks if block.strip()]
    
    for block in question_blocks:
        try:
            # Extract question text (everything before A:)
            question_text = re.search(r'(.*?)(?=A:)', block, re.DOTALL)
            question_text = question_text.group(1).strip() if question_text else ""
            
            # Extract options
            options = {}
            for option in ['A', 'B', 'C', 'D']:
                pattern = rf'{option}:\s*(.*?)(?=[A-D]:|Correct:|$)'
                match = re.search(pattern, block, re.DOTALL)
                if match:
                    options[option] = match.group(1).strip()
            
            # Extract correct answer
            correct = re.search(r'Correct:\s*([A-D])', block)
            correct_answer = correct.group(1) if correct else ""
            
            # Add question to list
            if question_text and options and correct_answer:
                questions.append({
                    "question": question_text,
                    "options": options,
                    "correct": correct_answer
                })
        except Exception as e:
            print(f"Error parsing question: {str(e)}")
            continue
    
    return questions

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "StudySpark API is running"})

if __name__ == '__main__':
    # For local development
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)