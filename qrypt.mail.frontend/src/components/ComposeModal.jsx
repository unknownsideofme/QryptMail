import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import AttachIcon from '@mui/icons-material/AttachFile';
import { useEmails } from '../context/EmailContext';

export default function ComposeModal({ open, onClose }) {
  const { sendEmail, saveDraft } = useEmails();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleSend = () => {
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    sendEmail(to, subject, body, cc, bcc, attachments);
    resetForm();
    onClose();
  };

  const handleSaveDraft = () => {
    if (!to.trim() && !subject.trim() && !body.trim()) return;
    saveDraft(to, subject, body);
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [
          ...prev,
          {
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            content: reader.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setTo('');
    setCc('');
    setBcc('');
    setShowCcBcc(false);
    setSubject('');
    setBody('');
    setAttachments([]);
  };

  return (
    <Dialog
      open={open}
      onClose={handleSaveDraft} // Auto-save draft on dismiss if content is written
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          backgroundColor: 'var(--bg-app)',
          boxShadow: 'var(--shadow-outset)',
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, backgroundColor: 'var(--bg-app)' }}>
        <Typography component="span" variant="h6" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)' }}>
          New Message
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ 
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-app)',
          boxShadow: 'var(--shadow-outset-sm)',
          width: 32,
          height: 32,
          borderRadius: '50%',
          '&:hover': { color: 'var(--text-primary)', boxShadow: 'var(--shadow-outset)' },
          '&:active': { boxShadow: 'var(--shadow-inset-sm)' }
        }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
        <TextField
          label="To"
          placeholder="recipient@example.com"
          fullWidth
          variant="outlined"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <Button 
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  sx={{ 
                    textTransform: 'none', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: 'var(--accent-primary)',
                    backgroundColor: 'var(--bg-app)',
                    boxShadow: 'var(--shadow-outset-sm)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '6px',
                    '&:hover': { backgroundColor: 'var(--bg-app)', boxShadow: 'var(--shadow-outset)' },
                    '&:active': { boxShadow: 'var(--shadow-inset-sm)' }
                  }}
                >
                  CC/BCC
                </Button>
              ),
              sx: {
                borderRadius: '12px',
                backgroundColor: 'var(--bg-app)',
                boxShadow: 'var(--shadow-inset)',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' }
              }
            }
          }}
        />

        {showCcBcc && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="CC"
              placeholder="cc@example.com"
              fullWidth
              variant="outlined"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-app)',
                  boxShadow: 'var(--shadow-inset)',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' }
                }
              }}
            />
            <TextField
              label="BCC"
              placeholder="bcc@example.com"
              fullWidth
              variant="outlined"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-app)',
                  boxShadow: 'var(--shadow-inset)',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' }
                }
              }}
            />
          </Box>
        )}

        <TextField
          label="Subject"
          placeholder="Enter subject line"
          fullWidth
          variant="outlined"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-inset)',
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' }
            }
          }}
        />

        <TextField
          label="Message"
          placeholder="Type your message here..."
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-inset)',
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' }
            }
          }}
        />

        {attachments.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
            {attachments.map((att, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.8,
                  px: 1.5,
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-app)',
                  boxShadow: 'var(--shadow-outset-sm)',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}
              >
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {att.filename}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeAttachment(index)}
                  sx={{ p: 0.2, color: 'var(--text-secondary)' }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: 'var(--bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            component="label"
            variant="text"
            startIcon={<AttachIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: 'var(--text-secondary)',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
              py: 1,
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 'var(--shadow-outset-sm)',
                color: 'var(--text-primary)'
              },
              '&:active': {
                boxShadow: 'var(--shadow-inset-sm)'
              }
            }}
          >
            Attach File
            <input
              type="file"
              multiple
              hidden
              onChange={handleFileChange}
            />
          </Button>

          <Button
            onClick={handleSaveDraft}
            variant="text"
            startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: 'var(--text-secondary)',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
              py: 1,
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 'var(--shadow-outset-sm)',
                color: 'var(--text-primary)'
              },
              '&:active': {
                boxShadow: 'var(--shadow-inset-sm)'
              }
            }}
          >
            Save Draft
          </Button>
        </Box>

        <Button
          onClick={handleSend}
          disabled={!to.trim() || !subject.trim() || !body.trim()}
          variant="contained"
          endIcon={<SendIcon sx={{ fontSize: 14 }} />}
          sx={{
            backgroundColor: 'var(--bg-app)',
            color: 'var(--accent-primary)',
            boxShadow: (!to.trim() || !subject.trim() || !body.trim()) ? 'none' : 'var(--shadow-outset-sm)',
            textTransform: 'none',
            fontWeight: 700,
            px: 3.5,
            py: 1.2,
            borderRadius: '10px',
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
      </DialogActions>
    </Dialog>
  );
}
