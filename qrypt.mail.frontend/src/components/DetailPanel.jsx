import React from 'react';
import { Box, Typography, IconButton, Tooltip, Avatar, Chip, Button } from '@mui/material';
import ArchiveIcon from '@mui/icons-material/ArchiveOutlined';
import SpamIcon from '@mui/icons-material/ReportOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import UnreadIcon from '@mui/icons-material/MailOutlineOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';
import ContinueIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/CheckCircle';
import { useEmails } from '../context/EmailContext';
import AttachmentCard from './AttachmentCard';
import QuickReply from './QuickReply';

export default function DetailPanel() {
  const { getSelectedEmail, toggleStar, deleteEmail, getFilteredEmails, selectedEmailId, selectEmail } = useEmails();
  const email = getSelectedEmail();
  const currentFolderEmails = getFilteredEmails();

  if (!email) {
    return (
      <Box className="detail-panel" sx={{ flex: 1, height: '100%' }}>
        <Box className="detail-empty-state" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
          <UnreadIcon sx={{ fontSize: 60, mb: 2, color: '#cbd5e1' }} />
          <Typography className="detail-empty-title" sx={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600 }}>
            Select an email to read
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
            Choose a conversation from the list to view its contents.
          </Typography>
        </Box>
      </Box>
    );
  }

  // Find index in current folder for pagination
  const currentIndex = currentFolderEmails.findIndex(m => m.id === email.id);
  const totalEmails = currentFolderEmails.length;

  const handleNext = () => {
    if (currentIndex < totalEmails - 1) {
      selectEmail(currentFolderEmails[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      selectEmail(currentFolderEmails[currentIndex - 1].id);
    }
  };

  // Check if sender should have verified badge
  const isVerifiedSender = ['figma', 'github', 'linkedin', 'spotify'].includes(email.sender.toLowerCase());

  // Render body content parsing bullet points vs paragraphs, rendering rich HTML inside sandboxed iframe
  const renderBody = (bodyText) => {
    if (!bodyText) return null;

    // Check if the body contains HTML tags or starts with a doctype
    const isHtml = /<[a-z][\s\S]*>/i.test(bodyText) || 
                   bodyText.trim().toLowerCase().startsWith('<!doctype') || 
                   bodyText.trim().toLowerCase().startsWith('<html');

    if (isHtml) {
      return (
        <iframe
          srcDoc={bodyText}
          title="Email Content"
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          style={{
            width: '100%',
            height: '450px',
            border: 'none',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-inset-sm)',
            overflow: 'auto'
          }}
          onLoad={(e) => {
            // Dynamically adjust iframe height to match content height!
            try {
              const iframe = e.target;
              if (iframe.contentWindow && iframe.contentDocument) {
                const body = iframe.contentDocument.body;
                iframe.style.height = `${Math.max(body.scrollHeight + 20, 450)}px`;
              }
            } catch (err) {
              console.warn("Could not auto-adjust iframe height due to origin restrictions:", err);
            }
          }}
        />
      );
    }

    const sections = bodyText.split('\n\n');
    return sections.map((section, idx) => {
      // Check if it's a bulleted list
      if (section.includes('\n•') || section.startsWith('•') || section.startsWith('-')) {
        const items = section.split('\n').map(item => item.replace(/^[•-]\s*/, '').trim()).filter(Boolean);
        return (
          <ul key={idx} style={{ paddingLeft: '24px', marginBottom: '16px', listStyleType: 'disc' }}>
            {items.map((item, i) => (
              <li key={i} style={{ marginBottom: '8px', color: '#334155', fontSize: '14px', lineHeight: 1.6 }}>
                {item}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <Typography 
          key={idx} 
          variant="body1" 
          sx={{ 
            mb: 2, 
            color: '#334155', 
            fontSize: '14px', 
            lineHeight: 1.6, 
            whiteSpace: 'pre-wrap' 
          }}
        >
          {section}
        </Typography>
      );
    });
  };

  return (
    <Box
      className="detail-panel"
      sx={{
        flex: 1,
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        boxShadow: 'var(--shadow-outset)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 3
      }}
    >
      {/* Top Toolbar */}
      <Box className="detail-toolbar" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px 24px', backgroundColor: 'var(--bg-app)' }}>
        <Box className="toolbar-actions" sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
          <Tooltip title="Archive" arrow>
            <IconButton className="toolbar-btn" size="small" onClick={() => deleteEmail(email.id)} sx={{ 
              color: 'var(--text-secondary)', 
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset-sm)',
              borderRadius: '8px',
              width: 34,
              height: 34,
              '&:hover': { color: 'var(--text-primary)', boxShadow: 'var(--shadow-outset)' },
              '&:active': { boxShadow: 'var(--shadow-inset-sm)' }
            }}>
              <ArchiveIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Spam" arrow>
            <IconButton className="toolbar-btn" size="small" sx={{ 
              color: 'var(--text-secondary)', 
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset-sm)',
              borderRadius: '8px',
              width: 34,
              height: 34,
              '&:hover': { color: 'var(--text-primary)', boxShadow: 'var(--shadow-outset)' },
              '&:active': { boxShadow: 'var(--shadow-inset-sm)' }
            }}>
              <SpamIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton className="toolbar-btn" size="small" onClick={() => deleteEmail(email.id)} sx={{ 
              color: 'var(--text-secondary)', 
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset-sm)',
              borderRadius: '8px',
              width: 34,
              height: 34,
              '&:hover': { color: '#ef4444', boxShadow: 'var(--shadow-outset)' },
              '&:active': { boxShadow: 'var(--shadow-inset-sm)' }
            }}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mark as Unread" arrow>
            <IconButton className="toolbar-btn" size="small" sx={{ 
              color: 'var(--text-secondary)', 
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset-sm)',
              borderRadius: '8px',
              width: 34,
              height: 34,
              '&:hover': { color: 'var(--text-primary)', boxShadow: 'var(--shadow-outset)' },
              '&:active': { boxShadow: 'var(--shadow-inset-sm)' }
            }}>
              <UnreadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Pagination controls */}
        {totalEmails > 0 && (
          <Box className="toolbar-pagination" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 700 }}>
              {currentIndex + 1}-{currentIndex + 1} of {totalEmails}
            </Typography>
            <Box className="pagination-controls" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={handlePrev} 
                disabled={currentIndex === 0}
                sx={{ 
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-app)',
                  boxShadow: currentIndex === 0 ? 'none' : 'var(--shadow-outset-sm)',
                  '&:hover:not(:disabled)': { boxShadow: 'var(--shadow-outset)' },
                  '&:active:not(:disabled)': { boxShadow: 'var(--shadow-inset-sm)' }
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleNext} 
                disabled={currentIndex === totalEmails - 1}
                sx={{ 
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-app)',
                  boxShadow: currentIndex === totalEmails - 1 ? 'none' : 'var(--shadow-outset-sm)',
                  '&:hover:not(:disabled)': { boxShadow: 'var(--shadow-outset)' },
                  '&:active:not(:disabled)': { boxShadow: 'var(--shadow-inset-sm)' }
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" sx={{ 
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: 'var(--bg-app)',
                boxShadow: 'var(--shadow-outset-sm)',
                color: 'var(--text-secondary)',
                '&:hover': { boxShadow: 'var(--shadow-outset)' },
                '&:active': { boxShadow: 'var(--shadow-inset-sm)' }
              }}>
                <MoreIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* Main Email Content scroll area */}
      <Box className="email-content-scroll" sx={{ flex: 1, overflowY: 'auto', p: '24px 32px' }}>
        {/* Sender details row */}
        <Box className="sender-info-card" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box className="sender-details" sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
            <Avatar
              className="sender-avatar-large"
              sx={{
                width: 44,
                height: 44,
                backgroundColor: email.avatarColor,
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'var(--font-heading)'
              }}
            >
              {email.avatarLetter}
            </Avatar>
            <Box className="sender-name-meta" sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box className="sender-name-row" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography className="sender-name" sx={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {email.sender}
                </Typography>
                {isVerifiedSender && (
                  <VerifiedIcon sx={{ fontSize: 15, color: '#2563eb' }} />
                )}
                <Typography className="sender-email" sx={{ fontSize: '12px', color: '#94a3b8' }}>
                  &lt;{email.email}&gt;
                </Typography>
              </Box>
              <Typography className="recipient-info" sx={{ fontSize: '12px', color: '#64748b', mt: 0.2 }}>
                to {email.to}
              </Typography>
              {email.cc && (
                <Typography className="recipient-info" sx={{ fontSize: '12px', color: '#64748b', mt: 0.1 }}>
                  cc: {email.cc}
                </Typography>
              )}
              {email.bcc && (
                <Typography className="recipient-info" sx={{ fontSize: '12px', color: '#64748b', mt: 0.1 }}>
                  bcc: {email.bcc}
                </Typography>
              )}
            </Box>
          </Box>

          <Box className="sender-date-actions" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography className="sender-date-text" sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              {email.date}
            </Typography>
            <IconButton 
              onClick={() => toggleStar(email.id)}
              sx={{ 
                color: email.starred ? '#eab308' : '#cbd5e1',
                p: 0.5,
                '&:hover': { color: email.starred ? '#eab308' : '#94a3b8' }
              }}
            >
              {email.starred ? <StarIcon sx={{ fontSize: 20 }} /> : <StarBorderIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>
        </Box>

        {/* Email Subject Line */}
        <Typography className="email-detail-subject" sx={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: '#0f172a', mb: 3, lineHeight: 1.35 }}>
          {email.subject}
        </Typography>

        {/* Email Body Content */}
        <Box className="email-detail-body" sx={{ mb: 4 }}>
          {renderBody(email.body)}
        </Box>

        {/* Attachments Section */}
        {email.attachments && email.attachments.length > 0 && (
          <Box className="attachments-section" sx={{ borderTop: '1px solid #eaedf4', pt: 3, mb: 4 }}>
            <Typography className="attachments-title" sx={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', mb: 2 }}>
              Attachment
            </Typography>
            <Box className="attachments-grid" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
              {email.attachments.map((attachment) => (
                <AttachmentCard key={attachment.id} attachment={attachment} messageId={email.id} />
              ))}
            </Box>
          </Box>
        )}

        {/* Conversation Replies Thread */}
        {email.replies && email.replies.length > 0 && (
          <Box sx={{ borderTop: '1px solid rgba(209, 217, 230, 0.4)', pt: 3, mt: 4, mb: 4 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', mb: 2.5 }}>
              Thread Responses
            </Typography>
            {email.replies.map((reply) => (
              <Box 
                key={reply.id} 
                sx={{ 
                  mb: 3, 
                  p: 2.5, 
                  backgroundColor: 'var(--bg-app)', 
                  boxShadow: 'var(--shadow-inset-sm)',
                  borderRadius: '16px'
                }}
              >
                <Box sx={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Avatar sx={{ width: 28, height: 28, backgroundColor: '#5925dc', color: 'white', fontSize: '11px', fontWeight: 600 }}>BT</Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{reply.sender}</Typography>
                      <Typography sx={{ fontSize: '11px', color: 'var(--text-muted)' }}>&lt;{reply.email}&gt;</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '11px', color: 'var(--text-muted)' }}>{reply.date}</Typography>
                </Box>
                <Typography sx={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {reply.body}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Quick Action buttons */}
        <Box className="detail-action-buttons" sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            className="detail-btn-outline"
            variant="outlined"
            startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset-sm)',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              borderRadius: '10px',
              px: 3,
              py: 1.2,
              border: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                border: 'none',
                boxShadow: 'var(--shadow-outset)',
                color: 'var(--text-primary)'
              },
              '&:active': {
                boxShadow: 'var(--shadow-inset-sm)'
              }
            }}
          >
            Reply
          </Button>
          <Button
            className="detail-btn-outline"
            variant="outlined"
            startIcon={<ContinueIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset-sm)',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              borderRadius: '10px',
              px: 3,
              py: 1.2,
              border: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                border: 'none',
                boxShadow: 'var(--shadow-outset)',
                color: 'var(--text-primary)'
              },
              '&:active': {
                boxShadow: 'var(--shadow-inset-sm)'
              }
            }}
          >
            Continue
          </Button>
        </Box>
      </Box>

      {/* Quick Reply Box */}
      <QuickReply emailId={email.id} />
    </Box>
  );
}
