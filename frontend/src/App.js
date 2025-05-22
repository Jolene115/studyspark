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
  Card,
  CardContent,
  Chip
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import QuizIcon from '@mui/icons-material/Quiz';

// Set up API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  // State management
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('adult');
  const [explanation, setExplanation] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Handle topic input change
  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  // Handle level selection change
  const handleLevelChange = (e) => {
    setLevel(e.target.value);
  };

  // Handle explanation and quiz generation
  const handleGenerateContent = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to learn about');
      return;
    }

    setLoading(true);
    setError(null);
    setShowResults(false);
    setExplanation('');
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizSubmitted(false);
    setScore(null);

    try {
      const response = await axios.post(`${API_URL}/api/explain`, {
        topic: topic.trim(),
        level
      });

      if (response.data.success) {
        setExplanation(response.data.explanation);
        setQuizQuestions(response.data.questions);
        setShowResults(true);
      } else {
        setError('Failed to generate content. Please try again.');
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err.response?.data?.error || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle quiz answer selection
  const handleAnswerChange = (questionIndex, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  // Submit quiz and calculate score
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correct) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setQuizSubmitted(true);
  };

  // Reset everything and start over
  const handleStartOver = () => {
    setTopic('');
    setLevel('adult');
    setShowResults(false);
    setExplanation('');
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizSubmitted(false);
    setScore(null);
    setError(null);
  };

  // Get level display info
  const getLevelInfo = (level) => {
    const levelInfo = {
      child: { label: 'Child (5-12 years)', color: 'success', icon: '👶' },
      teen: { label: 'Teen (13-17 years)', color: 'warning', icon: '🧑‍🎓' },
      adult: { label: 'Adult (18+ years)', color: 'primary', icon: '👨‍💼' }
    };
    return levelInfo[level] || levelInfo.adult;
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
          <Typography variant="subtitle1">
            Learn Any Topic at Your Level
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Topic input form */}
        {!showResults && (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LightbulbIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                What would you like to learn?
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Enter any topic and I'll explain it at your level, then test your understanding
              </Typography>
            </Box>
            
            <Stack spacing={3}>
              <TextField
                label="Topic to Learn"
                value={topic}
                onChange={handleTopicChange}
                variant="outlined"
                fullWidth
                placeholder="e.g., Photosynthesis, World War II, How computers work, etc."
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem'
                  }
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel id="level-select-label">Your Learning Level</InputLabel>
                <Select
                  labelId="level-select-label"
                  value={level}
                  label="Your Learning Level"
                  onChange={handleLevelChange}
                >
                  <MenuItem value="child">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>👶</span>
                      Child (5-12 years) - Simple explanations
                    </Box>
                  </MenuItem>
                  <MenuItem value="teen">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>🧑‍🎓</span>
                      Teen (13-17 years) - Clear but detailed
                    </Box>
                  </MenuItem>
                  <MenuItem value="adult">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>👨‍💼</span>
                      Adult (18+ years) - Comprehensive explanation
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={handleGenerateContent}
                disabled={loading || !topic.trim()}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <LightbulbIcon sx={{ mr: 1 }} />
                    Learn About This Topic
                  </>
                )}
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Results display */}
        {showResults && (
          <Stack spacing={3}>
            {/* Topic header */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                  {topic}
                </Typography>
                <Chip 
                  label={getLevelInfo(level).label}
                  color={getLevelInfo(level).color}
                  icon={<span>{getLevelInfo(level).icon}</span>}
                />
              </Box>
            </Paper>

            {/* Explanation section */}
            <Card elevation={3}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LightbulbIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    Explanation
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.7, fontSize: '1.1rem' }}>
                  {explanation}
                </Typography>
              </CardContent>
            </Card>

            {/* Quiz section */}
            {quizQuestions.length > 0 && (
              <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <QuizIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h5" component="h2">
                      Test Your Understanding
                    </Typography>
                  </Box>

                  {/* Quiz results */}
                  {quizSubmitted && score !== null && (
                    <Alert 
                      severity={score === quizQuestions.length ? "success" : score >= quizQuestions.length/2 ? "info" : "warning"}
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="h6">
                        Quiz Results: {score} out of {quizQuestions.length} correct 
                        ({Math.round((score/quizQuestions.length) * 100)}%)
                      </Typography>
                      <Typography>
                        {score === quizQuestions.length ? "Perfect! You understood everything!" :
                         score >= quizQuestions.length/2 ? "Good job! You got most of it right." :
                         "Keep learning! Review the explanation and try again."}
                      </Typography>
                    </Alert>
                  )}

                  {/* Quiz questions */}
                  <Stack spacing={3}>
                    {quizQuestions.map((question, qIndex) => (
                      <Paper key={qIndex} elevation={1} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Question {qIndex + 1}: {question.question}
                        </Typography>
                        
                        <RadioGroup
                          name={`question-${qIndex}`}
                          value={userAnswers[qIndex] || ''}
                          onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                        >
                          {Object.entries(question.options).map(([key, value]) => (
                            <FormControlLabel
                              key={key}
                              value={key}
                              control={<Radio />}
                              label={`${key}. ${value}`}
                              disabled={quizSubmitted}
                              sx={{
                                ...(quizSubmitted && key === question.correct && {
                                  color: 'success.main',
                                  '& .MuiFormControlLabel-label': { fontWeight: 'bold' },
                                }),
                                ...(quizSubmitted && userAnswers[qIndex] === key && key !== question.correct && {
                                  color: 'error.main',
                                }),
                              }}
                            />
                          ))}
                        </RadioGroup>
                        
                        {quizSubmitted && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mt: 2, 
                              p: 1,
                              borderRadius: 1,
                              bgcolor: userAnswers[qIndex] === question.correct ? 'success.light' : 'error.light',
                              color: userAnswers[qIndex] === question.correct ? 'success.dark' : 'error.dark',
                              fontWeight: 'bold'
                            }}
                          >
                            {userAnswers[qIndex] === question.correct 
                              ? '✓ Correct!' 
                              : `✗ Incorrect. The correct answer is ${question.correct}.`}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>

                  {/* Quiz actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleStartOver}
                    >
                      Learn New Topic
                    </Button>
                    
                    {!quizSubmitted ? (
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(userAnswers).length !== quizQuestions.length}
                      >
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleStartOver}
                      >
                        Learn Another Topic
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        )}
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ py: 3, mt: 'auto', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" color="text.secondary" align="center">
            StudySpark AI Tutor - Learn any topic at your level • Powered by OpenAI
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;