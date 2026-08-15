import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { EmailProvider, useEmails } from './context/EmailContext';
import Sidebar from './components/Sidebar';
import FolderPanel from './components/FolderPanel';
import DetailPanel from './components/DetailPanel';
import ComposeModal from './components/ComposeModal';
import Login from './components/Login';

function AppContent() {
  const { isAuthenticated, isDarkMode } = useEmails();
  const [composeOpen, setComposeOpen] = useState(false);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      background: {
        default: isDarkMode ? '#121214' : '#eef2f6',
        paper: isDarkMode ? '#1e1e22' : '#ffffff',
      },
      primary: {
        main: isDarkMode ? '#a78bfa' : '#5925dc',
      }
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
    }
  }), [isDarkMode]);

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <Login />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box 
        className="app-container"
        sx={{
          display: 'grid',
          gridTemplateColumns: '80px 360px 1fr',
          height: '100vh',
          width: '100vw',
          backgroundColor: 'var(--bg-app-outer)',
          overflow: 'hidden',
          '@media (max-width: 900px)': {
            gridTemplateColumns: '70px 300px 1fr'
          }
        }}
      >
        {/* Sidebar - Global Navigation */}
        <Sidebar onComposeClick={() => setComposeOpen(true)} />
        
        {/* FolderPanel - Email List & Search */}
        <FolderPanel onComposeClick={() => setComposeOpen(true)} />
        
        {/* DetailPanel - Reading pane & Quick reply */}
        <DetailPanel />
        
        {/* Compose Email Modal */}
        <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <EmailProvider>
      <AppContent />
    </EmailProvider>
  );
}
