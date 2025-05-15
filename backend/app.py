from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import openai
from dotenv import load_dotenv
import json
import time

# Load environment variables
load_dotenv()

# Create a Flask app instance
app = Flask(__name__)
CORS(app)  # Allow frontend access

# Set OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')
# Simple in-memory cache for responses (production would use Redis)
response_cache = {}
CACHE_EXPIRY = 3600  # Cache expiry in seconds (1 hour)

@app.route('/api/ask', methods=['POST'])
def ask():
    """
    Enhanced endpoint to ask questions about a topic at a specific learning level.
    Returns an explanation and multiple choice questions in a structured format.
    """
    try:
        # Get data from request
        data = request.json
        
        # Validate input data
        if not data:
            return jsonify({"error": "Request body is required"}), 400
            
        topic = data.get('topic')
        level = data.get('level', 'beginner')  # Default to beginner if not specified
        
        # Validate required fields
        if not topic:
            return jsonify({"error": "Topic is required"}), 400
        
        # Check cache first
        cache_key = f"{topic.lower()}_{level.lower()}"
        current_time = time.time()
        
        if cache_key in response_cache:
            cached_data = response_cache[cache_key]
            if current_time - cached_data['timestamp'] < CACHE_EXPIRY:
                return jsonify(cached_data['response'])
        
        # Structure the prompt for consistent formatting        
        prompt = f"""
        Explain '{topic}' to a {level}-level learner.
        
        The response should be structured as follows:
        
        1. EXPLANATION: A clear and concise explanation of the topic tailored to {level} level, roughly 3-4 paragraphs.
        
        2. KEY CONCEPTS: List 3-5 key concepts or important points about the topic.
        
        3. QUESTIONS: Create 3 multiple choice questions to test understanding, with 4 options each.
        
        Format each question exactly like this:
        
        Q1: [Question text]
        A) [Option A]
        B) [Option B]
        C) [Option C]
        D) [Option D]
        Correct Answer: [Letter]
        Explanation: [Brief explanation of why this is correct]
        
        Make sure the content is accurate, educational, and appropriate for the {level} level.
        """
        
        # Call OpenAI API with system message for better context
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are StudySpark, an educational AI tutor designed to explain topics clearly and create helpful practice questions. Your responses should be structured, accurate, and tailored to the student's level of understanding."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,  # Slightly creative but mostly factual
            max_tokens=1500   # Allow enough space for comprehensive response
        )
        
        # Extract response text
        response_text = completion.choices[0].message.content
        
        # Process the response to extract explanation, key concepts and questions
        sections = {}
        
        # Split by markers
        if "EXPLANATION:" in response_text:
            parts = response_text.split("KEY CONCEPTS:")
            if len(parts) > 1:
                explanation = parts[0].replace("EXPLANATION:", "").strip()
                remainder = parts[1]
                
                # Extract key concepts and questions
                if "QUESTIONS:" in remainder:
                    concepts_questions = remainder.split("QUESTIONS:")
                    key_concepts = concepts_questions[0].strip()
                    questions = concepts_questions[1].strip()
                    
                    # Structure the response
                    sections = {
                        "explanation": explanation,
                        "keyConcepts": key_concepts,
                        "questions": questions
                    }
        
        # If structured parsing failed, return the full text
        if not sections:
            sections = {
                "fullText": response_text
            }
            
        # Prepare response object
        structured_response = {
            "topic": topic,
            "level": level,
            "content": sections
        }
        
        # Cache the response
        response_cache[cache_key] = {
            'response': structured_response,
            'timestamp': current_time
        }
        
        return jsonify(structured_response)
        
    except Exception as e:
        # Log the error (in production, use a proper logging solution)
        print(f"Error in /api/ask: {str(e)}")
        return jsonify({
            "error": "Something went wrong processing your request",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)