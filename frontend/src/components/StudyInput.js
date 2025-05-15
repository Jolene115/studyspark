import React from 'react';
import { Box, Typography, Paper, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const StudyInput = ({ studyContent, numQuestions, onContentChange, onNumQuestionsChange, onGenerateQuiz, loading }) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Enter Your Study Content
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }} align="center">
        Paste your study notes, textbook excerpts, or learning materials below, and StudySpark will generate a custom quiz to test your knowledge.
      </Typography>
      
      <TextField
        label="Study Content"
        multiline
        rows={8}
        value={studyContent}
        onChange={onContentChange}
        variant="outlined"
        fullWidth
        sx={{ mb: 3 }}
        placeholder="Paste your notes, textbook paragraphs, or other study material here..."
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="num-questions-label">Questions</InputLabel>
          <Select
            labelId="num-questions-label"
            value={numQuestions}
            label="Questions"
            onChange={onNumQuestionsChange}
          >
            {[3, 5, 7, 10].map(num => (
              <MenuItem key={num} value={num}>{num} questions</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onGenerateQuiz}
          disabled={loading || !studyContent.trim()}
          sx={{ minWidth: 180 }}
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Tip: The more specific and focused your content, the better the quiz questions will be.
      </Typography>
    </Paper>
  );
};

export default StudyInput;