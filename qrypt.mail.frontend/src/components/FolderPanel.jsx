import React from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton, Button, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterIcon from '@mui/icons-material/FilterList';
import CreateIcon from '@mui/icons-material/Create';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEmails } from '../context/EmailContext';
import FolderItem from './FolderItem';

export default function FolderPanel({ onComposeClick }) {
  const {
    activeFolder,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    getFilteredEmails,
    isLoadingEmails,
    nextPageToken,
    fetchEmails
  } = useEmails();

  const filteredEmails = getFilteredEmails();

  // Helper to format folder title
  const getFolderTitle = () => {
    switch (activeFolder) {
      case 'inbox': return 'Inbox';
      case 'drafts': return 'Drafts';
      case 'sent': return 'Sent Box';
      case 'starred': return 'Starred';
      case 'trash': return 'Trash';
      default: return 'Emails';
    }
  };

  return (
    <Box
      className="folder-panel"
      sx={{
        width: 360,
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        boxShadow: 'var(--shadow-outset)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 4
      }}
    >
      {/* Header section */}
      <Box className="folder-header" sx={{ p: '24px 20px 16px 24px' }}>
        <Box className="folder-title-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            className="folder-title"
            sx={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}
          >
            {getFolderTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              onClick={onComposeClick}
              startIcon={<CreateIcon sx={{ fontSize: 14 }} />}
              sx={{
                backgroundColor: 'var(--bg-app)',
                color: 'var(--accent-primary)',
                boxShadow: 'var(--shadow-outset)',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '12px',
                borderRadius: '10px',
                py: 0.8,
                px: 1.8,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'var(--bg-app)',
                  boxShadow: 'var(--shadow-outset)',
                },
                '&:active': {
                  boxShadow: 'var(--shadow-inset)'
                }
              }}
            >
              Compose
            </Button>
            <IconButton 
              className="folder-action-btn" 
              size="small" 
              onClick={() => fetchEmails(false)}
              disabled={isLoadingEmails}
              sx={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-app)',
                boxShadow: 'var(--shadow-outset)',
                borderRadius: '8px',
                width: 32,
                height: 32,
                '&:hover': { backgroundColor: 'var(--bg-app)', boxShadow: 'var(--shadow-outset)', color: 'var(--text-primary)' },
                '&:active': { boxShadow: 'var(--shadow-inset)' },
                '&:disabled': { opacity: 0.7 }
              }}
            >
              {isLoadingEmails ? (
                <CircularProgress size={18} sx={{ color: 'var(--accent-primary)' }} />
              ) : (
                <RefreshIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
            <IconButton className="folder-action-btn" size="small" sx={{ 
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset)',
              borderRadius: '8px',
              width: 32,
              height: 32,
              '&:hover': { backgroundColor: 'var(--bg-app)', boxShadow: 'var(--shadow-outset)', color: 'var(--text-primary)' },
              '&:active': { boxShadow: 'var(--shadow-inset)' }
            }}>
              <FilterIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box className="search-box-container" sx={{ position: 'relative', width: '100%', mb: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search"
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--text-muted)', fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '12px',
                backgroundColor: 'var(--bg-app)',
                boxShadow: 'var(--shadow-inset)',
                fontSize: '14px',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                }
              }
            }}
          />
        </Box>

        {/* Filter Tabs */}
        <Box 
          className="filter-tabs" 
          sx={{ 
            display: 'flex', 
            backgroundColor: 'var(--bg-app)', 
            boxShadow: 'var(--shadow-inset-sm)',
            p: '4px', 
            borderRadius: '12px' 
          }}
        >
          {['all', 'read', 'unread'].map((tab) => (
            <Box
              key={tab}
              onClick={() => setFilter(tab)}
              className={`filter-tab ${filter === tab ? 'active' : ''}`}
              sx={{
                flex: 1,
                textAlign: 'center',
                py: 0.8,
                fontSize: '13px',
                fontWeight: 600,
                color: filter === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                borderRadius: '8px',
                backgroundColor: filter === tab ? 'var(--bg-app)' : 'transparent',
                boxShadow: filter === tab ? 'var(--shadow-outset-sm)' : 'none',
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Scrollable Email List */}
      <Box 
        className="email-list-scroll" 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          px: 2, 
          pb: 3 
        }}
      >
        {filteredEmails.length > 0 ? (
          <>
            {filteredEmails.map((email) => (
              <FolderItem key={email.id} email={email} />
            ))}
            
            {nextPageToken && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => fetchEmails(true)}
                  disabled={isLoadingEmails}
                  sx={{
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--accent-primary)',
                    boxShadow: 'var(--shadow-outset)',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    borderRadius: '8px',
                    py: 1,
                    px: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'var(--bg-app)',
                      boxShadow: 'var(--shadow-outset)',
                      color: 'var(--text-primary)'
                    },
                    '&:active': {
                      boxShadow: 'var(--shadow-inset)'
                    },
                    '&:disabled': {
                      color: 'var(--text-muted)',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {isLoadingEmails ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        ) : isLoadingEmails ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
            <CircularProgress size={28} sx={{ color: '#5925dc' }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
              Fetching emails from server...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
              No messages found
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
