import React from 'react';
import { Typography, Paper, Box, Link } from '@mui/material';

const QuizQuestion = ({ question, index, userAnswer, isSubmitted, onAnswerChange }) => {
  const { question: questionText, options, correct } = question;
  
  const handleChange = (event) => {
    onAnswerChange(index, event.target.value);
  };
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3,
        borderLeft: isSubmitted ? 
          (userAnswer === correct ? '4px solid #4caf50' : '4px solid #f44336') : 
          '4px solid #e0e0e0'
      }}
    >
      <Typography variant="h6" component="h3" gutterBottom>
        Question {index + 1}
      </Typography>
      
      <Typography variant="body1" paragraph>
        {questionText}
      </Typography>
      
      <Box component="form">
        {Object.entries(options).map(([key, value]) => (
          <Box 
            key={key} 
            sx={{ 
              p: 1, 
              mb: 1, 
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              cursor: isSubmitted ? 'default' : 'pointer',
              bgcolor: isSubmitted ? 
                (key === correct ? 'rgba(76, 175, 80, 0.1)' : 
                  (userAnswer === key ? 'rgba(244, 67, 54, 0.1)' : 'transparent')) : 
                (userAnswer === key ? 'rgba(63, 81, 181, 0.1)' : 'transparent'),
              '&:hover': {
                bgcolor: isSubmitted ? 
                  (key === correct ? 'rgba(76, 175, 80, 0.1)' : 
                    (userAnswer === key ? 'rgba(244, 67, 54, 0.1)' : 'transparent')) : 
                  'rgba(63, 81, 181, 0.05)'
              }
            }}
            onClick={() => !isSubmitted && onAnswerChange(index, key)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  border: '2px solid',
                  borderColor: userAnswer === key ? 
                    (isSubmitted ? 
                      (key === correct ? '#4caf50' : '#f44336') : 
                      '#3f51b5') : 
                    '#757575',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mr: 2,
                  position: 'relative'
                }}
              >
                {userAnswer === key && (
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: isSubmitted ? 
                        (key === correct ? '#4caf50' : '#f44336') : 
                        '#3f51b5',
                    }} 
                  />
                )}
              </Box>
              <Typography 
                variant="body1"
                sx={{
                  fontWeight: isSubmitted && key === correct ? 700 : 400
                }}
              >
                <strong>{key}:</strong> {value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      
      {isSubmitted && (
        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="body2" 
            color={userAnswer === correct ? 'success.main' : 'error.main'}
            fontWeight="medium"
          >
            {userAnswer === correct ? 
              '✓ Correct!' : 
              `✗ Incorrect. The correct answer is ${correct}.`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default QuizQuestion;