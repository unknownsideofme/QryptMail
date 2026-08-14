import React, { useState } from 'react';
import { Box } from '@mui/material';
import { EmailProvider, useEmails } from './context/EmailContext';
import Sidebar from './components/Sidebar';
import FolderPanel from './components/FolderPanel';
import DetailPanel from './components/DetailPanel';
import ComposeModal from './components/ComposeModal';
import Login from './components/Login';

function AppContent() {
  const { isAuthenticated } = useEmails();
  const [composeOpen, setComposeOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Box 
      className="app-container"
      sx={{
        display: 'grid',
        gridTemplateColumns: '80px 360px 1fr',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f5f6fa',
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
  );
}

export default function App() {
  return (
    <EmailProvider>
      <AppContent />
    </EmailProvider>
  );
}
