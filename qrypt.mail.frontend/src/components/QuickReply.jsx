import React, { useState } from 'react';
import { Box, TextField, Button, Avatar, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useEmails } from '../context/EmailContext';

export default function QuickReply({ emailId }) {
  const { addReply } = useEmails();
  const [replyText, setReplyText] = useState('');

  const handleSend = () => {
    if (!replyText.trim()) return;
    addReply(emailId, replyText);
    setReplyText('');
  };

  const handleKeyDown = (e) => {
    // Ctrl + Enter or Cmd + Enter to send
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  return (
    <Box
      className="quick-reply-container"
      sx={{
        backgroundColor: 'var(--bg-app)',
        p: 3
      }}
    >
      <Box
        className="quick-reply-wrapper"
        sx={{
          backgroundColor: 'var(--bg-app)',
          boxShadow: 'var(--shadow-inset)',
          borderRadius: '20px',
          p: 2,
          transition: 'all 0.15s ease',
          '&:focus-within': {
            boxShadow: 'var(--shadow-inset), 0 0 10px rgba(99, 102, 241, 0.1)'
          }
        }}
      >
        {/* Reply Message Input */}
        <TextField
          multiline
          placeholder="Type anything..."
          variant="standard"
          fullWidth
          rows={2}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '13px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)'
            }
          }}
        />

        {/* Footer controls */}
        <Box className="quick-reply-footer" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
          {/* User profile identifier */}
          <Box className="quick-reply-user" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              className="quick-reply-user-avatar"
              sx={{
                width: 24,
                height: 24,
                backgroundColor: 'var(--bg-app)',
                boxShadow: 'var(--shadow-outset-sm)',
                color: 'var(--accent-primary)',
                fontSize: '10px',
                fontWeight: 700
              }}
            >
              BT
            </Avatar>
            <Typography sx={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Byl Thalassa
            </Typography>
          </Box>

          {/* Action buttons */}
          <Box className="quick-reply-actions" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              className="btn-discard"
              onClick={() => setReplyText('')}
              size="small"
              sx={{
                color: 'var(--text-secondary)',
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                borderRadius: '8px',
                '&:hover': {
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-outset-sm)'
                },
                '&:active': {
                  boxShadow: 'var(--shadow-inset-sm)'
                }
              }}
            >
              Discard
            </Button>
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!replyText.trim()}
              endIcon={<SendIcon sx={{ fontSize: 14 }} />}
              sx={{
                backgroundColor: 'var(--bg-app)',
                color: 'var(--accent-primary)',
                boxShadow: replyText.trim() ? 'var(--shadow-outset-sm)' : 'none',
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                py: 0.8,
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover:not(:disabled)': {
                  backgroundColor: 'var(--bg-app)',
                  boxShadow: 'var(--shadow-outset)',
                  color: 'var(--accent-primary)'
                },
                '&:active:not(:disabled)': {
                  boxShadow: 'var(--shadow-inset-sm)'
                },
                '&.Mui-disabled': {
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-muted)',
                  boxShadow: 'none',
                  opacity: 0.6
                }
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
