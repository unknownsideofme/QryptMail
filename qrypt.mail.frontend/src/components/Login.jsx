import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Grid, CircularProgress, Alert } from '@mui/material';
import LogoIcon from '@mui/icons-material/Mail';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { useEmails } from '../context/EmailContext';

export default function Login() {
  const { loginDemo, loginUnipile } = useEmails();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  // Check URL query parameters for redirect success/failure from server OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const failure = params.get('failure');
    const errorMsg = params.get('error');
    if (success === 'true') {
      const appToken = params.get('appToken');
      const email = params.get('email');
      const name = params.get('name');
      const userId = params.get('userId');
      if (appToken && email) {
        setIsLoading(true);
        setLoadingMessage('Configuring connection details...');
        loginUnipile(appToken, email, name, userId);
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsLoading(false);
      } else {
        setError('Missing credentials from authentication redirect.');
      }
    } else if (failure === 'true') {
      setError(errorMsg || 'OAuth authentication failed. Please check your credentials or network and try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [loginUnipile]);

  // Triggers redirect to local server OAuth endpoint
  const handleOAuthRedirect = (provider) => {
    setError('');
    setIsLoading(true);
    
    const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    const isElectron = typeof window !== 'undefined' && window.electronAPI && window.electronAPI.isElectron;
    
    if (isElectron) {
      setLoadingMessage(`Please complete secure login via ${provider === 'google' ? 'Google' : 'Microsoft'} in your web browser...`);
      const desktopOrigin = 'qryptmail://auth';
      const authUrl = `${serverUrl}/api/auth/${provider}?origin=${encodeURIComponent(desktopOrigin)}`;
      window.electronAPI.openExternal(authUrl);
    } else {
      setLoadingMessage(`Redirecting to secure login via ${provider === 'google' ? 'Google' : 'Microsoft'}...`);
      const origin = window.location.origin;
      if (provider === 'google') {
        window.location.href = `${serverUrl}/api/auth/google?origin=${encodeURIComponent(origin)}`;
      } else if (provider === 'microsoft') {
        window.location.href = `${serverUrl}/api/auth/microsoft?origin=${encodeURIComponent(origin)}`;
      } else {
        setError(`Authentication for provider "${provider}" is not supported.`);
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          height: '100vh', 
          width: '100vw', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          gap: 3
        }}
      >
        <CircularProgress sx={{ color: '#7c3aed' }} size={50} />
        <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.8 }}>
          {loadingMessage}
        </Typography>
        {error && (
          <Box sx={{ maxWidth: 400, mt: 2 }}>
            <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px' }}>
              {error}
            </Alert>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Card
        sx={{
          width: 480,
          p: 5,
          borderRadius: '24px',
          backgroundColor: 'var(--bg-app)',
          boxShadow: 'var(--shadow-outset)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box 
          sx={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            backgroundColor: 'var(--bg-app)',
            boxShadow: 'var(--shadow-outset-sm)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5
          }}
        >
          <LogoIcon sx={{ fontSize: 30 }} />
        </Box>

        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800, 
            color: 'var(--text-primary)',
            fontSize: '24px',
            mb: 0.5
          }}
        >
          QryptMail.com
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'var(--text-secondary)', 
            fontWeight: 700,
            mb: 4.5
          }}
        >
          Connect your account via Secure Mail Server
        </Typography>

        {error && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: '10px' }}>
              {error}
            </Alert>
          </Box>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOAuthRedirect('google')}
              startIcon={<GoogleIcon sx={{ color: '#db4437' }} />}
              sx={{
                py: 1.5,
                borderColor: 'transparent',
                backgroundColor: 'var(--bg-app)',
                boxShadow: 'var(--shadow-outset-sm)',
                color: 'var(--text-secondary)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '12px'
              }}
            >
              Google
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOAuthRedirect('microsoft')}
              startIcon={<MicrosoftIcon sx={{ color: '#0078d4' }} />}
              sx={{
                py: 1.5,
                borderColor: 'transparent',
                backgroundColor: 'var(--bg-app)',
                boxShadow: 'var(--shadow-outset-sm)',
                color: 'var(--text-secondary)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '12px'
              }}
            >
              Outlook
            </Button>
          </Grid>
        </Grid>

        <Button
          fullWidth
          variant="contained"
          onClick={loginDemo}
          sx={{
            py: 1.6,
            backgroundColor: 'var(--bg-app)',
            color: 'var(--accent-primary)',
            boxShadow: 'var(--shadow-outset)',
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '12px',
            fontSize: '14px',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'var(--bg-app)',
              boxShadow: 'var(--shadow-outset)',
              transform: 'translateY(-1px)'
            },
            '&:active': {
              boxShadow: 'var(--shadow-inset)'
            }
          }}
        >
          Try Demo Inbox
        </Button>
      </Card>
    </Box>
  );
}
