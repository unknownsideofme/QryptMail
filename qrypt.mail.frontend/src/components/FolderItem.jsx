import React from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AttachmentIcon from '@mui/icons-material/Attachment';
import { useEmails } from '../context/EmailContext';

export default function FolderItem({ email }) {
  const { selectedEmailId, selectEmail, toggleStar, isDarkMode } = useEmails();
  const isSelected = selectedEmailId === email.id;

  const handleStarClick = (e) => {
    e.stopPropagation();
    toggleStar(email.id);
  };

  // Helper to determine brand colors/logos or initial circles
  const getBrandMeta = () => {
    switch (email.sender.toLowerCase()) {
      case 'figma':
        return { color: '#0acf83', bg: '#e6faf2', text: 'Figma', label: 'Figma' };
      case 'github':
        return { color: '#24292f', bg: '#f1f5f9', text: 'GitHub', label: 'GitHub' };
      case 'linkedin':
        return { color: '#0077b5', bg: '#eff6ff', text: 'LinkedIn', label: 'LinkedIn' };
      case 'spotify':
        return { color: '#1ed760', bg: '#edfbf3', text: 'Spotify', label: 'Spotify' };
      default:
        return { color: '#6366f1', bg: '#e0e7ff', text: 'Personal', label: email.sender };
    }
  };

  const brand = getBrandMeta();

  return (
    <Box
      onClick={() => selectEmail(email.id)}
      className={`email-item ${isSelected ? 'selected' : ''}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        borderRadius: '16px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        mb: 1.5,
        backgroundColor: isSelected 
          ? (isDarkMode ? '#1c1c22' : 'rgba(89, 25, 220, 0.05)') 
          : 'var(--bg-app)',
        borderLeft: isSelected 
          ? '4px solid var(--accent-primary)' 
          : '4px solid transparent',
        pl: isSelected ? 1.5 : 2,
        boxShadow: isSelected ? 'var(--shadow-inset-sm)' : 'var(--shadow-outset-sm)',
        '&:hover': {
          boxShadow: isSelected ? 'var(--shadow-inset-sm)' : 'var(--shadow-outset)',
          transform: isSelected ? 'none' : 'translateY(-1.5px)'
        }
      }}
    >
      {/* Blue Unread Dot */}
      {email.isUnread && (
        <Box
          className="email-item-unread-dot"
          sx={{
            position: 'absolute',
            left: 8,
            top: 24,
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            boxShadow: '0 0 8px rgba(37, 99, 235, 0.5)'
          }}
        />
      )}

      {/* Header Info */}
      <Box className="email-item-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, pl: email.isUnread ? 1 : 0 }}>
        <Typography
          className="email-item-sender"
          sx={{
            fontSize: '14px',
            fontWeight: email.isUnread ? 700 : 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)'
          }}
        >
          {email.sender}
        </Typography>
        <Typography
          className="email-item-date"
          sx={{
            fontSize: '11px',
            color: '#94a3b8',
            fontWeight: 500
          }}
        >
          {email.date}
        </Typography>
      </Box>

      {/* Subject Line */}
      <Typography
        className="email-item-subject"
        sx={{
          fontSize: '13px',
          fontWeight: email.isUnread ? 700 : 600,
          color: email.isUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
          mb: 0.5,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pl: email.isUnread ? 1 : 0
        }}
      >
        {email.subject}
      </Typography>

      {/* Snippet Preview */}
      <Typography
        className="email-item-body-preview"
        sx={{
          fontSize: '12px',
          color: '#64748b',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          mb: 1.5,
          pl: email.isUnread ? 1 : 0
        }}
      >
        {email.body}
      </Typography>

      {/* Footer Info (Sender Category / Attachments / Star) */}
      <Box className="email-item-footer" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: email.isUnread ? 1 : 0 }}>
        <Box
          className="email-item-sender-meta"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
            px: 1.2,
            borderRadius: '20px',
            backgroundColor: 'var(--bg-app)',
            boxShadow: 'var(--shadow-inset-sm)',
            color: brand.color,
            fontSize: '11px',
            fontWeight: 700
          }}
        >
          {/* Mock Letter Avatar for Brand Icon */}
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '3px',
              backgroundColor: brand.color,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: 800
            }}
          >
            {email.avatarLetter.slice(0, 1)}
          </Box>
          <Typography sx={{ fontSize: '11px', fontWeight: 600 }}>{brand.label}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {email.attachments && email.attachments.length > 0 && (
            <AttachmentIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
          )}
          <Box
            onClick={handleStarClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: email.starred ? '#eab308' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'transform 0.15s',
              '&:hover': {
                transform: 'scale(1.2)',
                color: email.starred ? '#eab308' : '#94a3b8'
              }
            }}
          >
            {email.starred ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
