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

@app.route('/api/explain', methods=['POST'])
def explain_topic():
    try:
        # Get request data
        data = request.json
        topic = data.get('topic', '')
        level = data.get('level', 'adult')  # child, teen, adult
        
        if not topic:
            return jsonify({"error": "Topic is required"}), 400
        
        # Validate level
        valid_levels = ['child', 'teen', 'adult']
        if level not in valid_levels:
            return jsonify({"error": "Level must be one of: child, teen, adult"}), 400
        
        # Create age-appropriate prompts
        level_prompts = {
            'child': f"Explain {topic} in a simple, fun way that a 5-12 year old child would understand. Use simple words, short sentences, and maybe include an analogy or example they can relate to. Keep it engaging and not scary.",
            'teen': f"Explain {topic} in a way that a teenager (13-17 years old) would understand. Use clear language but you can include more complex concepts. Make it interesting and relevant to their world.",
            'adult': f"Explain {topic} in a comprehensive way for an adult learner. Include important details, context, and implications. Be thorough but clear."
        }
        
        # Generate explanation using OpenAI
        explanation_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an educational tutor that explains topics clearly based on the learner's age level."},
                {"role": "user", "content": level_prompts[level]}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        explanation = explanation_response.choices[0].message['content']
        
        # Generate quiz questions based on the topic and level
        quiz_prompts = {
            'child': f"Create 2-3 very simple quiz questions about {topic} for young children. Use easy words and make it multiple choice with 3 options (A, B, C). Make sure the questions test basic understanding in a fun way.",
            'teen': f"Create 2-3 quiz questions about {topic} for teenagers. Make them multiple choice with 4 options (A, B, C, D). The questions should test understanding but not be too difficult.",
            'adult': f"Create 3 quiz questions about {topic} for adult learners. Make them multiple choice with 4 options (A, B, C, D). The questions should test comprehension and application of the concepts."
        }
        
        quiz_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"You are creating quiz questions. Format each question like this:\n\nQ: [Question text]\nA: [Option A]\nB: [Option B]\nC: [Option C]\n{'D: [Option D]' if level != 'child' else ''}\nCorrect: [Correct option letter]"},
                {"role": "user", "content": quiz_prompts[level]}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        # Extract quiz questions from OpenAI response
        quiz_text = quiz_response.choices[0].message['content']
        questions = extract_questions(quiz_text, level)
        
        return jsonify({
            "success": True,
            "topic": topic,
            "level": level,
            "explanation": explanation,
            "questions": questions
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to generate content: {str(e)}"}), 500

def extract_questions(quiz_text, level):
    """
    Parse the OpenAI response to extract structured quiz questions
    """
    questions = []
    
    # Split by Q: to get individual questions
    question_blocks = re.split(r'Q:\s*', quiz_text)
    
    # Skip the first element if it's empty
    question_blocks = [block for block in question_blocks if block.strip()]
    
    # Determine option letters based on level
    option_letters = ['A', 'B', 'C'] if level == 'child' else ['A', 'B', 'C', 'D']
    
    for block in question_blocks:
        try:
            # Extract question text (everything before A:)
            question_text = re.search(r'(.*?)(?=A:)', block, re.DOTALL)
            question_text = question_text.group(1).strip() if question_text else ""
            
            # Extract options
            options = {}
            for option in option_letters:
                pattern = rf'{option}:\s*(.*?)(?=[A-D]:|Correct:|$)'
                match = re.search(pattern, block, re.DOTALL)
                if match:
                    options[option] = match.group(1).strip()
            
            # Extract correct answer
            correct = re.search(r'Correct:\s*([A-D])', block)
            correct_answer = correct.group(1) if correct else ""
            
            # Add question to list
            if question_text and options and correct_answer and correct_answer in options:
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
    return jsonify({"status": "ok", "message": "StudySpark AI Tutor API is running"})

if __name__ == '__main__':
    # For local development
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)