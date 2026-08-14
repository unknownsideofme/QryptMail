import React from 'react';
import { Box, Tooltip, Badge, Avatar, IconButton } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Description';
import SentIcon from '@mui/icons-material/Send';
import StarredIcon from '@mui/icons-material/Star';
import TrashIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/HelpOutlineOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoIcon from '@mui/icons-material/Mail';
import LogoutIcon from '@mui/icons-material/Logout';
import { useEmails } from '../context/EmailContext';

export default function Sidebar({ onComposeClick }) {
  const { activeFolder, setActiveFolder, getUnreadCount, logout, userEmail, isDemoMode } = useEmails();

  const getInitials = () => {
    if (isDemoMode) return 'DL';
    if (!userEmail) return 'U';
    const parts = userEmail.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userEmail.slice(0, 2).toUpperCase();
  };

  const tooltipTitle = isDemoMode 
    ? 'Dominic Libero (Demo Mode)' 
    : `${userEmail} (Live Mode)`;

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon />, showBadge: true },
    { id: 'drafts', label: 'Drafts', icon: <DraftsIcon />, showBadge: false },
    { id: 'sent', label: 'Sent Box', icon: <SentIcon />, showBadge: false },
    { id: 'starred', label: 'Starred', icon: <StarredIcon />, showBadge: false },
    { id: 'trash', label: 'Trash', icon: <TrashIcon />, showBadge: false }
  ];

  return (
    <Box
      className="sidebar"
      sx={{
        width: 80,
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        boxShadow: 'var(--shadow-outset)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        justifyContent: 'space-between',
        zIndex: 5
      }}
    >
      <Box className="sidebar-top" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
        {/* App Logo */}
        <Box 
          className="sidebar-logo" 
          onClick={() => setActiveFolder('inbox')}
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            backgroundColor: 'var(--bg-app)',
            boxShadow: 'var(--shadow-outset-sm)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: 'var(--shadow-outset)',
              transform: 'scale(1.05)'
            }
          }}
        >
          <LogoIcon sx={{ fontSize: 26 }} />
        </Box>

        {/* Navigation Items */}
        <Box className="sidebar-nav" sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', alignItems: 'center' }}>
          {navItems.map((item) => {
            const isActive = activeFolder === item.id;
            const unreadCount = item.showBadge ? getUnreadCount(item.id) : 0;

            return (
              <Tooltip key={item.id} title={item.label} placement="right" arrow>
                <IconButton
                  onClick={() => setActiveFolder(item.id)}
                  sx={{
                    position: 'relative',
                    width: 46,
                    height: 46,
                    borderRadius: '12px',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-app)',
                    boxShadow: isActive ? 'var(--shadow-inset-sm)' : 'var(--shadow-outset-sm)',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: 'var(--bg-app)',
                      boxShadow: 'var(--shadow-outset)',
                      color: 'var(--accent-primary)'
                    }
                  }}
                >
                  {item.showBadge && unreadCount > 0 ? (
                    <Badge 
                      badgeContent={unreadCount} 
                      color="primary" 
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: 'var(--accent-blue)',
                          color: '#ffffff',
                          fontSize: 10,
                          height: 18,
                          minWidth: 18,
                          borderRadius: 9,
                          border: '2px solid var(--bg-app)'
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* Footer Navigation */}
      <Box className="sidebar-bottom" sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%' }}>
        <Tooltip title="Help & Feedback" placement="right" arrow>
          <IconButton sx={{ 
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-app)',
            boxShadow: 'var(--shadow-outset-sm)',
            width: 38,
            height: 38,
            borderRadius: '10px',
            '&:hover': { color: 'var(--accent-primary)', boxShadow: 'var(--shadow-outset)' }
          }}>
            <HelpIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings" placement="right" arrow>
          <IconButton sx={{ 
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-app)',
            boxShadow: 'var(--shadow-outset-sm)',
            width: 38,
            height: 38,
            borderRadius: '10px',
            '&:hover': { color: 'var(--accent-primary)', boxShadow: 'var(--shadow-outset)' }
          }}>
            <SettingsIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Sign Out" placement="right" arrow>
          <IconButton onClick={logout} sx={{ 
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-app)',
            boxShadow: 'var(--shadow-outset-sm)',
            width: 38,
            height: 38,
            borderRadius: '10px',
            '&:hover': { color: '#ef4444', boxShadow: 'var(--shadow-outset)' }
          }}>
            <LogoutIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={tooltipTitle} placement="right" arrow>
          <Avatar 
            className="sidebar-avatar"
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset-sm)',
              color: 'var(--accent-primary)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': {
                boxShadow: 'var(--shadow-outset)'
              }
            }}
          >
            {getInitials()}
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  );
}
