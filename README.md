## ⚠️ AITHON 2025 Hackathon Notice

This branch (`aithon-2025`) was created for the **AITHON 2025: AI for Social Good Hackathon**.  
**Project Title:** StudySpark: EqualLearn

This version enhances the original StudySpark AI tutor to focus on accessible, AI-powered education for underserved learners.

---

# StudySpark: EqualLearn

A personalized AI tutoring backend built with Flask and Gemini AI — adapted for AITHON 2025 to promote equitable access to education.

---

## 👥 Project Name & Team Members

- **Project Name:** StudySpark: EqualLearn  
- **Team Members:** Jing Yi Teoh, Felicia Tan

---

## 🔍 Problem Statement

Millions of students lack personalized academic support due to financial, geographic, or institutional barriers. Without tailored learning tools, they struggle to understand complex topics or retain what they learn. There’s a need for an AI-powered solution that is both accessible and adaptive.

---

## 🤖 AI Solution Overview

**StudySpark: EqualLearn**:
- Accepts a topic from the user
- Uses **Google Gemini AI** to generate clear, level-appropriate explanations
- Creates **multiple-choice quiz questions** to reinforce learning

The backend uses prompt engineering to communicate with Gemini, then parses and formats the response using regular expressions. This allows consistent delivery of explanations and self-testing content for learners of different age groups.

---

## 🌍 Social Impact & Ethics

**Impact**  
- Enables learning without dependence on costly tutors  
- Empowers self-paced, offline-accessible study support  
- Potential for use by NGOs, teachers, and rural students  

**Ethical Considerations**  
- No personal data is collected  
- Content is generated with bias-aware prompts  
- Transparent use of AI (users know content is AI-generated)  
- Design allows for future multilingual and accessibility support

---

## 📦 Hackathon Deliverables

- ✅ `aithon-2025` GitHub branch (this codebase)  
- 📊 `/docs/presentation.pdf` — [to be added]  
- 🎥 Demo video — [coming soon]  
- ✅ A functional backend demonstrating AI-generated explanations and quizzes

---

# 🔧 Technical Project Background

## 📘 Overview
StudySpark is a personalized AI tutoring backend built using Flask and Google’s Gemini AI model. This backend is responsible for receiving user input, generating topic-specific explanations, and returning multiple-choice quiz questions tailored to the user’s learning level. The system is designed to help learners — whether children, teens, or adults — understand difficult topics through clear explanations and self-testing.

The backend exposes two main endpoints: one for generating quiz questions and another for health-checking the API. It also includes CORS support to allow integration with a React frontend.

---

## 🔁 API Endpoints

- `POST /api/generate-quiz`  
  Accepts a topic and number of questions, then returns a set of quiz questions (with options and answers) along with an explanation.

- `GET /api/health`  
  Simple health check to confirm the backend is live.

---

**Key Functionality**

The backend listens for POST requests to /api/generate-quiz, where it accepts a topic (study content) and the number of questions requested. It uses Google’s Gemini AI model to return a structured response containing multiple quiz questions with four answer options each (A, B, C, D), as well as the correct answer. The logic also handles parsing and formatting the Gemini model’s output using regular expressions.

A health check route (/api/health) is included to confirm that the backend is running and reachable. This is especially useful for deployment environments and frontend integration testing.

---

**Backend Setup**

The backend is implemented in app.py and uses Flask for routing, along with flask-cors to allow frontend access. Environment variables are managed using python-dotenv, and the Gemini API key is securely loaded from a .env file that is not committed to the repository.

To support deployment on platforms like Render, the backend includes a Procfile with the command web: gunicorn app:app, allowing the app to run with a production-grade WSGI server (Gunicorn) instead of Flask's development server.

---

**Project Structure and Files**

1. *app.py*: The main Flask application file. It contains route definitions and logic for communicating with the Gemini AI model, extracting structured quiz data, and responding to client requests.
2. *requirements.txt*: Lists all required Python packages, including Flask, the Gemini AI model integration library, Gunicorn, and dotenv.
3. *Procfile*: Tells Render how to start the application using Gunicorn.
4. *.gitignore*: Ensures that files like .env, virtual environments, and macOS system files are excluded from version control.
5. *.env.example*: A template file that outlines the required environment variables, allowing collaborators or reviewers to set up their own .env files without exposing your actual API key.

---

**Features**

* *Explain Any Topic*: Input any concept, and receive an explanation tailored to your level.
* *Adaptive Quiz Generator*: Automatically generates multiple-choice quiz questions from your study material.
* *Powered by Google Gemini AI*: Uses Google’s Gemini AI for rich, contextual content.
* *Backend with Flask*: RESTful API architecture with clean endpoints.
* *Production-Ready*: Deployable on Render using Gunicorn.

---

**How to Run Locally**

To run the backend on your local machine, you first navigate to the backend/ directory. It’s recommended (but not required) to set up a virtual environment using venv. Then, you install the dependencies listed in requirements.txt and create a .env file with your actual Gemini API key.
The Flask app is run using python app.py. By default, it runs on port 5050, but this can be changed if needed. Once running, the /api/health route can be accessed from the browser or Postman to verify that the backend is online. The /api/generate-quiz route is intended to be called from the frontend or an API client.

---

**Security and Environment Variables**

The .env file, which contains the sensitive Gemini API key, is intentionally excluded from the repository using .gitignore. This prevents accidental sharing of secret keys. Instead, a .env.example file is included to guide collaborators or testers on how to configure their environment correctly.
For deployment on platforms like Render, the API key should be added through Render’s web interface as an environment variable.

---

**Deployment Notes**

This backend is designed to be deployed on Render using the following configuration:

* The root directory for the backend should be set to backend/.
* The build command should be: pip install -r requirements.txt.
* The start command must be: gunicorn app:app.
* The environment variable Gemini API key must be defined in the Render dashboard.

Once deployed, the app will automatically serve requests through Render’s assigned port using Gunicorn.

---

**Final Remarks**

StudySpark’s backend is secure, scalable, and ready for production. It is built with clean separation of concerns and follows best practices for environment management and API structure. The use of Google Gemini AI allows for highly personalized and accurate content generation, while Flask ensures simplicity and flexibility in deployment and development.

This project was developed as part of the DevNetwork AI/ML Hackathon 2025, with a focus on making education more accessible and interactive using modern AI technologies.

---

## ⚠️ Assumptions & Limitations

- Explanations and quiz content rely fully on Google Gemini AI; quality depends on model performance  
- Only supports English input  
- Stateless: does not store user history, preferences, or quiz results  
- Assumes access to a valid Gemini API key and internet connection  
- No frontend UI included in this submission; designed for API consumption or integration

---

## 📚 Data Sources

- No external datasets are used or stored.  
- All content is generated dynamically via **Google Gemini AI** using controlled prompt templates.  
- The AI is prompted with user-defined topics to create tailored educational content and quizzes.

---