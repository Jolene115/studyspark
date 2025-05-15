import React from 'react';
import { Box, Typography, LinearProgress, Paper } from '@mui/material';

const QuizResult = ({ score, total }) => {
  const percentage = Math.round((score / total) * 100);
  
  let feedback = "";
  let color = "";
  
  if (percentage >= 90) {
    feedback = "Excellent! You've mastered this material.";
    color = "success.main";
  } else if (percentage >= 70) {
    feedback = "Good job! You have a solid understanding of the material.";
    color = "success.main";
  } else if (percentage >= 50) {
    feedback = "You're on the right track. Review the questions you missed and try again.";
    color = "warning.main";
  } else {
    feedback = "Keep studying! Review the material and try the quiz again.";
    color = "error.main";
  }
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderTop: 4, borderColor: color }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Quiz Results
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3" component="p" color={color} sx={{ fontWeight: 'bold' }}>
          {percentage}%
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={
            percentage >= 70 ? "success" : 
            percentage >= 50 ? "warning" : 
            "error"
          }
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      
      <Typography align="center" sx={{ mb: 1 }}>
        You scored <strong>{score}</strong> out of <strong>{total}</strong> questions correctly.
      </Typography>
      
      <Typography variant="body1" align="center" color={color}>
        {feedback}
      </Typography>
    </Paper>
  );
};

export default QuizResult;