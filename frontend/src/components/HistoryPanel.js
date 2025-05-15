import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';

const HistoryPanel = ({ history, onClose, onClearHistory, onLoadQuiz, onRemoveFromHistory }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            Quiz History
          </Typography>
        </Box>
        <Box>
          <Button 
            color="secondary" 
            onClick={onClose}
            startIcon={<CloseIcon />}
            sx={{ mr: 1 }}
          >
            Close
          </Button>
          {history.length > 0 && (
            <Button 
              color="error" 
              onClick={onClearHistory}
              variant="outlined"
              size="small"
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {history.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            You haven't generated any quizzes yet.
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            When you create quizzes, they'll appear here for easy access.
          </Typography>
        </Box>
      ) : (
        <List>
          {history.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography 
                      component="span" 
                      variant="body1" 
                      sx={{ fontWeight: 500 }}
                      noWrap
                    >
                      {item.content}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block' }}
                      >
                        {item.date}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {item.questions.length} questions
                      </Typography>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onLoadQuiz(item)}
                    sx={{ mr: 1 }}
                  >
                    Load
                  </Button>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={() => onRemoveFromHistory(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default HistoryPanel;