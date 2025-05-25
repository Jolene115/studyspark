import React, { useState, useEffect, createContext, useContext } from 'react';
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
  IconButton,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  ThemeProvider,
  createTheme,
  Switch,
  FormControlLabel as MuiFormControlLabel,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import QuizIcon from '@mui/icons-material/Quiz';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Joyride, { STATUS } from 'react-joyride';

// Set up API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// User levels with descriptions
const USER_LEVELS = {
  child: { label: 'Child (Ages 6-12)', icon: '👶' },
  teen: { label: 'Teen (Ages 13-18)', icon: '👨‍🎓' },
  adult: { label: 'Adult (18+)', icon: '👨‍💼' }
};

// Onboarding steps
const TOUR_STEPS = [
  {
    target: '.topic-input',
    content: 'Enter any topic you want to learn about!',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.level-select',
    content: 'Choose your learning level for personalized content',
    placement: 'bottom'
  },
  {
    target: '.generate-button',
    content: 'Click here to generate an explanation and quiz',
    placement: 'bottom'
  },
  {
    target: '.explanation-tab',
    content: 'View the main explanation and real-world examples',
    placement: 'bottom'
  },
  {
    target: '.quiz-tab',
    content: 'Test your knowledge with interactive quizzes',
    placement: 'bottom'
  },
  {
    target: '.history-button',
    content: 'Access your learning history anytime',
    placement: 'bottom'
  },
  {
    target: '.settings-section',
    content: 'Customize your experience with dark mode and text size',
    placement: 'bottom'
  }
];

// Create theme context
const ThemeContext = createContext();

function App() {
  // State management
  const [topic, setTopic] = useState('');
  const [userLevel, setUserLevel] = useState('teen');
  const [explanation, setExplanation] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [runTour, setRunTour] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontSize: fontSize === 'small' ? 14 : fontSize === 'large' ? 18 : 16,
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  });

  // Load preferences from local storage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('studySparkDarkMode');
    const savedFontSize = localStorage.getItem('studySparkFontSize');
    const hasSeenTutorial = localStorage.getItem('studySparkTutorialSeen');
    
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    if (savedFontSize) setFontSize(savedFontSize);
    if (!hasSeenTutorial) {
      setTimeout(() => setRunTour(true), 1000);
    }
  }, []);

  // Handle tour completion
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem('studySparkTutorialSeen', 'true');
      setRunTour(false);
    }
  };

  // Load history from local storage on component mount
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

  // Handle topic input changes
  const handleTopicChange = (e) => {
    setTopic(e.target.value);
  };

  // Handle user level changes
  const handleUserLevelChange = (e) => {
    setUserLevel(e.target.value);
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Handle font size change
  const handleFontSizeChange = (event) => {
    setFontSize(event.target.value);
  };

  // Generate explanation and quiz
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setExplanation(null);
    setQuizQuestions([]);
    setUserAnswers({});
    setScore(null);
    setIsSubmitted(false);

    try {
      const response = await axios.post(`${API_URL}/api/generate`, {
        topic,
        userLevel
      });

      if (response.data.success) {
        setExplanation(response.data.explanation);
        setQuizQuestions(response.data.questions);
        
        // Save to history
        const newItem = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          topic,
          userLevel,
          explanation: response.data.explanation,
          questions: response.data.questions
        };
        
        setHistory(prevHistory => [newItem, ...prevHistory.slice(0, 9)]); // Keep only 10 most recent
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
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out'
      }}>
        {/* Welcome Message */}
        <Fade in={showWelcome}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'background.paper',
              zIndex: 1300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3
            }}
          >
            <Grow in={showWelcome}>
              <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
                <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" gutterBottom>
                  Welcome to StudySpark!
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                  Your personalized AI learning companion
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setShowWelcome(false)}
                  sx={{ mt: 2 }}
                >
                  Get Started
                </Button>
              </Box>
            </Grow>
          </Box>
        </Fade>

        {/* Onboarding Tour */}
        <Joyride
          steps={TOUR_STEPS}
          run={runTour}
          continuous
          showProgress
          showSkipButton
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: theme.palette.primary.main,
              zIndex: 1400
            }
          }}
        />

        {/* Header */}
        <AppBar position="static" color="primary">
          <Toolbar>
            <SchoolIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              StudySpark AI Tutor
            </Typography>
            <Box className="settings-section" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                <InputLabel>Text Size</InputLabel>
                <Select
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  label="Text Size"
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
              <IconButton color="inherit" onClick={handleDarkModeToggle}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <IconButton color="inherit" onClick={() => setRunTour(true)} sx={{ ml: 1 }}>
                <HelpOutlineIcon />
              </IconButton>
            </Box>
            {!showHistory && (
              <Button 
                className="history-button"
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
          {!showHistory ? (
            <>
              {/* Input Section */}
              <Zoom in={!showWelcome}>
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Learn Something New
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      className="topic-input"
                      fullWidth
                      label="Enter a topic"
                      value={topic}
                      onChange={handleTopicChange}
                      placeholder="e.g., Photosynthesis, World War II, Quantum Physics"
                    />
                    <FormControl className="level-select" fullWidth>
                      <InputLabel>Learning Level</InputLabel>
                      <Select
                        value={userLevel}
                        onChange={handleUserLevelChange}
                        label="Learning Level"
                      >
                        {Object.entries(USER_LEVELS).map(([level, { label, icon }]) => (
                          <MenuItem key={level} value={level}>
                            {icon} {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      className="generate-button"
                      variant="contained"
                      color="primary"
                      onClick={handleGenerate}
                      disabled={loading || !topic.trim()}
                      startIcon={loading ? <CircularProgress size={20} /> : <SchoolIcon />}
                    >
                      {loading ? 'Generating...' : 'Generate Explanation & Quiz'}
                    </Button>
                  </Stack>
                </Paper>
              </Zoom>

              {/* Error Display */}
              {error && (
                <Fade in={!!error}>
                  <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Content Display */}
              {explanation && (
                <Grow in={!!explanation}>
                  <Paper elevation={3} sx={{ mb: 4 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} centered>
                      <Tab className="explanation-tab" icon={<LightbulbIcon />} label="Explanation" />
                      <Tab className="quiz-tab" icon={<QuizIcon />} label="Quiz" />
                    </Tabs>
                    <Box sx={{ p: 3 }}>
                      {activeTab === 0 ? (
                        <Stack spacing={3}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Main Explanation
                              </Typography>
                              <Typography variant="body1" paragraph>
                                {explanation.main}
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Real-World Example
                              </Typography>
                              <Typography variant="body1">
                                {explanation.analogy}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Stack>
                      ) : (
                        // Quiz Section
                        <Stack spacing={3}>
                          {quizQuestions.map((question, index) => (
                            <Card key={index}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  Question {index + 1}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                  {question.question}
                                </Typography>
                                <RadioGroup
                                  value={userAnswers[index] || ''}
                                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                                >
                                  {question.options.map((option, optIndex) => (
                                    <FormControlLabel
                                      key={optIndex}
                                      value={option}
                                      control={<Radio />}
                                      label={option}
                                      disabled={isSubmitted}
                                    />
                                  ))}
                                </RadioGroup>
                                {isSubmitted && (
                                  <Box sx={{ mt: 2 }}>
                                    <Chip
                                      label={userAnswers[index] === question.correct ? 'Correct!' : 'Incorrect'}
                                      color={userAnswers[index] === question.correct ? 'success' : 'error'}
                                      sx={{ mr: 1 }}
                                    />
                                    {userAnswers[index] !== question.correct && (
                                      <Typography variant="body2" color="text.secondary">
                                        Correct answer: {question.correct}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          ))}
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
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" gutterBottom>
                                Your Score: {score} out of {quizQuestions.length}
                              </Typography>
                              <Button
                                variant="outlined"
                                onClick={handleResetQuiz}
                                sx={{ mr: 1 }}
                              >
                                Try Again
                              </Button>
                              <Button
                                variant="contained"
                                onClick={() => setActiveTab(0)}
                              >
                                Review Explanation
                              </Button>
                            </Box>
                          )}
                        </Stack>
                      )}
                    </Box>
                  </Paper>
                </Grow>
              )}
            </>
          ) : (
            // History Panel
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  Learning History
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
                  No learning history found
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
                          <Typography variant="h6">
                            {item.topic}
                          </Typography>
                          <Chip
                            label={USER_LEVELS[item.userLevel].label}
                            size="small"
                            sx={{ mr: 1 }}
                          />
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
                            Review
                          </Button>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveFromHistory(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          )}
        </Container>

        {/* Footer */}
        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
            mt: 'auto', 
            bgcolor: 'background.paper', 
            borderTop: 1, 
            borderColor: 'divider',
            transition: 'background-color 0.3s ease-in-out'
          }}
        >
          <Container maxWidth="md">
            <Typography variant="body2" color="text.secondary" align="center">
              StudySpark AI Tutor - Powered by OpenAI
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;