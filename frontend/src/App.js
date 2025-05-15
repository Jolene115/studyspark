import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Divider,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

// Set up API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  // State management
  const [studyContent, setStudyContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load quiz history from local storage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('studySparkHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history from localStorage:', e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('studySparkHistory', JSON.stringify(history));
    }
  }, [history]);

  // Handle study content changes
  const handleContentChange = (e) => {
    setStudyContent(e.target.value);
  };

  // Handle number of questions changes
  const handleNumQuestionsChange = (e) => {
    setNumQuestions(e.target.value);
  };

  // Handle quiz generation
  const handleGenerateQuiz = async () => {
    if (!studyContent.trim()) {
      setError('Please enter some study content');
      return;
    }

    setLoading(true);
    setError(null);
    setQuizQuestions([]);
    setUserAnswers({});
    setScore(null);
    setIsSubmitted(false);

    try {
      const response = await axios.post(`${API_URL}/api/generate-quiz`, {
        studyContent,
        numQuestions
      });

      if (response.data.success && response.data.questions.length > 0) {
        setQuizQuestions(response.data.questions);
        setQuizMode(true);
        
        // Save to history
        const newQuizItem = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          content: studyContent.substring(0, 100) + (studyContent.length > 100 ? '...' : ''),
          questions: response.data.questions
        };
        
        setHistory(prevHistory => [newQuizItem, ...prevHistory.slice(0, 9)]); // Keep only 10 most recent
      } else {
        setError('No quiz questions were generated. Try again with different content.');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection for a question
  const handleAnswerChange = (questionIndex, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  // Submit the quiz and calculate score
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correct) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setIsSubmitted(true);
  };

  // Reset quiz and go back to content input
  const handleResetQuiz = () => {
    setQuizMode(false);
    setQuizQuestions([]);
    setUserAnswers({});
    setScore(null);
    setIsSubmitted(false);
  };

  // Load a quiz from history
  const handleLoadQuiz = (historyItem) => {
    setQuizQuestions(historyItem.questions);
    setQuizMode(true);
    setUserAnswers({});
    setScore(null);
    setIsSubmitted(false);
    setShowHistory(false);
  };

  // Remove a quiz from history
  const handleRemoveFromHistory = (id) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      localStorage.setItem('studySparkHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('studySparkHistory');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            StudySpark AI Tutor
          </Typography>
          {!showHistory && (
            <Button 
              color="inherit" 
              startIcon={<HistoryIcon />}
              onClick={() => setShowHistory(true)}
            >
              History
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* History panel */}
        {showHistory && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Quiz History
              </Typography>
              <Box>
                <Button 
                  color="secondary" 
                  onClick={() => setShowHistory(false)}
                  startIcon={<CloseIcon />}
                  sx={{ mr: 1 }}
                >
                  Close
                </Button>
                {history.length > 0 && (
                  <Button 
                    color="error" 
                    onClick={handleClearHistory}
                    startIcon={<DeleteIcon />}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {history.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                No quiz history found
              </Typography>
            ) : (
              <Stack spacing={2}>
                {history.map((item) => (
                  <Paper key={item.id} elevation={1} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {item.date}
                        </Typography>
                        <Typography variant="body1">
                          {item.content}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.questions.length} questions
                        </Typography>
                      </Box>
                      <Box>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleLoadQuiz(item)}
                          sx={{ mr: 1 }}
                        >
                          Load
                        </Button>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveFromHistory(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        )}

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Content input */}
        {!quizMode && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              StudySpark AI Tutor
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 3 }}>
              Paste your study content below to generate a personalized quiz
            </Typography>
            
            <TextField
              label="Study Content"
              multiline
              rows={10}
              value={studyContent}
              onChange={handleContentChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
              placeholder="Paste your notes, textbook paragraphs, or other study material here..."
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="num-questions-label">Number of Questions</InputLabel>
                <Select
                  labelId="num-questions-label"
                  value={numQuestions}
                  label="Number of Questions"
                  onChange={handleNumQuestionsChange}
                >
                  {[3, 5, 7, 10].map(num => (
                    <MenuItem key={num} value={num}>{num} questions</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleGenerateQuiz}
                disabled={loading || !studyContent.trim()}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Quiz'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Quiz display */}
        {quizMode && quizQuestions.length > 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Your Quiz
            </Typography>
            
            {/* Quiz results */}
            {isSubmitted && score !== null && (
              <Box sx={{ mb: 3 }}>
                <Alert 
                  severity={score/quizQuestions.length >= 0.7 ? "success" : "warning"}
                  sx={{ mb: 2 }}
                >
                  You scored {score} out of {quizQuestions.length} ({Math.round(score/quizQuestions.length * 100)}%)
                </Alert>
              </Box>
            )}

            {/* Quiz questions */}
            {quizQuestions.map((q, qIndex) => (
              <Box key={qIndex} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {qIndex + 1}. {q.question}
                </Typography>
                
                <RadioGroup
                  name={`question-${qIndex}`}
                  value={userAnswers[qIndex] || ''}
                  onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                >
                  {Object.entries(q.options).map(([key, value]) => (
                    <FormControlLabel
                      key={key}
                      value={key}
                      control={<Radio />}
                      label={`${key}: ${value}`}
                      disabled={isSubmitted}
                      sx={{
                        ...(isSubmitted && key === q.correct && {
                          color: 'success.main',
                          '& .MuiFormControlLabel-label': { fontWeight: 'bold' },
                        }),
                        ...(isSubmitted && userAnswers[qIndex] === key && key !== q.correct && {
                          color: 'error.main',
                        }),
                      }}
                    />
                  ))}
                </RadioGroup>
                
                {isSubmitted && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 1, 
                      color: userAnswers[qIndex] === q.correct ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}
                  >
                    {userAnswers[qIndex] === q.correct 
                      ? '✓ Correct!' 
                      : `✗ Incorrect. The correct answer is ${q.correct}.`}
                  </Typography>
                )}
              </Box>
            ))}

            {/* Quiz actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                variant="outlined" 
                onClick={handleResetQuiz}
              >
                Back to Content
              </Button>
              
              {!isSubmitted ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length !== quizQuestions.length}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={handleResetQuiz}
                >
                  Create New Quiz
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ py: 3, mt: 'auto', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" color="text.secondary" align="center">
            StudySpark AI Tutor - Powered by OpenAI
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;