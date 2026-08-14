import React from 'react';
import { Box, Typography } from '@mui/material';
import { PictureAsPdf as PdfIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import { useEmails } from '../context/EmailContext';

export default function AttachmentCard({ attachment, messageId }) {
  const { downloadAttachment } = useEmails();
  const isPdf = attachment.type === 'pdf' || attachment.name.endsWith('.pdf');

  return (
    <Box
      className="attachment-card"
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        borderRadius: '12px',
        gap: 1.5,
        backgroundColor: 'var(--bg-app)',
        boxShadow: 'var(--shadow-outset-sm)',
        transition: 'all 0.15s ease',
        '&:hover': {
          boxShadow: 'var(--shadow-outset)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      {/* File Icon Cover */}
      <Box
        className="attachment-icon-box"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '8px',
          backgroundColor: 'var(--bg-app)',
          boxShadow: 'var(--shadow-inset-sm)',
          color: isPdf ? '#ef4444' : '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {isPdf ? <PdfIcon sx={{ fontSize: 22 }} /> : <FileIcon sx={{ fontSize: 22 }} />}
      </Box>

      {/* Info and Actions */}
      <Box className="attachment-info" sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Typography
          className="attachment-name"
          sx={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {attachment.name}
        </Typography>
        <Typography
          className="attachment-size"
          sx={{
            fontSize: '11px',
            color: '#94a3b8',
            mt: 0.2
          }}
        >
          {attachment.size}
        </Typography>

        <Box className="attachment-actions" sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
          <Typography
            className="attachment-action-link"
            onClick={() => downloadAttachment(messageId, attachment.id, attachment.name)}
            sx={{
              fontSize: '11px',
              color: '#5925dc',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            View
          </Typography>
          <Typography
            className="attachment-action-link"
            onClick={() => downloadAttachment(messageId, attachment.id, attachment.name)}
            sx={{
              fontSize: '11px',
              color: '#5925dc',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Download
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
