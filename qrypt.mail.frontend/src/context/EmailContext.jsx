import React, { createContext, useState, useContext, useEffect } from 'react';

const EmailContext = createContext();

const initialEmails = [
  {
    id: '1',
    sender: 'Figma',
    email: 'hello@figma.com',
    to: 'Byl Thalassa',
    subject: 'Congratulations! Your Plugin is Now Live in the Figma Community',
    body: `We're excited to let you know that your plugin, Auto Layout Pro, has successfully passed the review process and is now officially available in the Figma Community. Designers from all over the world can now access, use, and benefit from your incredible work!

To view your plugin and monitor its performance:
• Access the plugin page: Track downloads, user feedback, and ratings in real-time.
• Join discussions: Engage with the Figma community by answering questions and improving your plugin based on feedback.
• Update regularly: Keep your plugin relevant by continuously improving it, adding new features, or fixing any bugs.

Thank you for contributing to the Figma ecosystem! We can't wait to see the creative impact your plugin will have.`,
    date: '16 Nov, 11:45 PM',
    timestamp: new Date('2026-11-16T23:45:00').getTime(),
    folder: 'inbox',
    isUnread: true,
    starred: false,
    avatarColor: '#0acf83', // Figma Green
    avatarLetter: 'F',
    attachments: [
      { id: 'att-1', name: 'Figma File.pdf', size: '2.4 MB', type: 'pdf' }
    ],
    replies: []
  },
  {
    id: '2',
    sender: 'GitHub',
    email: 'noreply@github.com',
    to: 'Byl Thalassa',
    subject: 'New GitHub Features!',
    body: `We're excited to let you know that we have rolled out several new enhancements to your developer dashboard. 

Here's what is new:
• Faster GitHub Actions Runners: Build jobs start up to 30% quicker.
• Advanced Branch Protection: Require multiple reviews, linear history, and signoffs.
• Interactive PR Checklists: Task lists are now fully interactive directly within the PR timeline.

Check out the settings page in your repository to enable these features.`,
    date: '15 Nov, 8:20 PM',
    timestamp: new Date('2026-11-15T20:20:00').getTime(),
    folder: 'inbox',
    isUnread: true,
    starred: false,
    avatarColor: '#24292f', // Dark
    avatarLetter: 'G',
    attachments: [],
    replies: []
  },
  {
    id: '3',
    sender: 'Orion Alistair',
    email: 'orion.alistair@gmail.com',
    to: 'Byl Thalassa',
    subject: 'Just Checking In!',
    body: `I hope this message finds you well! I've been meaning to reach out and see how you're doing. It's been a while since our last project sync. 

I'd love to chat and hear about what you're working on. Let me know if you have some time for a virtual coffee this week! I'm generally free on Wednesday afternoon or Thursday morning.

Best,
Orion`,
    date: '14 Nov, 9:15 AM',
    timestamp: new Date('2026-11-14T09:15:00').getTime(),
    folder: 'inbox',
    isUnread: false,
    starred: true,
    avatarColor: '#ec4899', // Pink
    avatarLetter: 'OA',
    attachments: [],
    replies: []
  },
  {
    id: '4',
    sender: 'LinkedIn',
    email: 'jobs-noreply@linkedin.com',
    to: 'Byl Thalassa',
    subject: 'Your Figma plugin has been approved',
    body: `You are gaining visibility on LinkedIn. 3 new profile views occurred today. 

Explore recommendations tailored to your profile and connect with designers in the community. Let's build your professional network.`,
    date: '13 Nov, 10:00 AM',
    timestamp: new Date('2026-11-13T10:00:00').getTime(),
    folder: 'inbox',
    isUnread: false,
    starred: false,
    avatarColor: '#0077b5', // LinkedIn Blue
    avatarLetter: 'in',
    attachments: [],
    replies: []
  },
  {
    id: '5',
    sender: 'Elara Whitford',
    email: 'elara.w@designco.com',
    to: 'Byl Thalassa',
    subject: 'Hello, Byl!',
    body: `I was thinking about you today and figured I'd send some good vibes your way. 😊 I know things can get pretty busy, but let me know how the design project is coming along.

Let's catch up soon! I have a few suggestions for the prototype.`,
    date: '12 Nov, 4:10 PM',
    timestamp: new Date('2026-11-12T16:10:00').getTime(),
    folder: 'inbox',
    isUnread: false,
    starred: false,
    avatarColor: '#14b8a6', // Teal
    avatarLetter: 'EW',
    attachments: [],
    replies: []
  },
  {
    id: '6',
    sender: 'Spotify',
    email: 'no-reply@spotify.com',
    to: 'Byl Thalassa',
    subject: 'Your Weekly Playlist is Ready!',
    body: `Dive into a mix of fresh hits and timeless classics, carefully selected just for you. This week, we have featured Taylor Swift, some incredible indie rock tracks, and electronic dance discoveries. 

Open Spotify to start listening now!`,
    date: '11 Nov, 8:05 AM',
    timestamp: new Date('2026-11-11T08:05:00').getTime(),
    folder: 'inbox',
    isUnread: false,
    starred: false,
    avatarColor: '#1ed760', // Spotify Green
    avatarLetter: 'S',
    attachments: [],
    replies: []
  },
  // Drafts
  {
    id: 'd-1',
    sender: 'Byl Thalassa',
    email: 'byl.t@qryptmail.com',
    to: 'alex@designco.com',
    subject: 'Draft Proposal for Client Review',
    body: `Hi Alex,

I've drafted the design proposal for our client review. Please check the attachment and let me know if we need to refine the wireframes before the presentation tomorrow.

Thanks,
Byl`,
    date: '12 Nov, 2:30 PM',
    timestamp: new Date('2026-11-12T14:30:00').getTime(),
    folder: 'drafts',
    isUnread: false,
    starred: false,
    avatarColor: '#64748b',
    avatarLetter: 'D',
    attachments: [
      { id: 'att-2', name: 'Proposal-Draft.pdf', size: '1.8 MB', type: 'pdf' }
    ],
    replies: []
  },
  // Sent Box
  {
    id: 's-1',
    sender: 'Byl Thalassa',
    email: 'byl.t@qryptmail.com',
    to: 'manager@company.com',
    subject: 'Q4 Design Deliverables Update',
    body: `Hi, I have completed the styling modifications and the interactive components for the email application. It is ready for your review.

Please let me know if you would like to run through the code together.`,
    date: '10 Nov, 5:00 PM',
    timestamp: new Date('2026-11-10T17:00:00').getTime(),
    folder: 'sent',
    isUnread: false,
    starred: false,
    avatarColor: '#64748b',
    avatarLetter: 'BT',
    attachments: [],
    replies: []
  },
  // Trash
  {
    id: 't-1',
    sender: 'Best Offers',
    email: 'spam@offers.com',
    to: 'Byl Thalassa',
    subject: 'Get 90% Off Your Next Purchase!',
    body: `Limited time offer! Buy now and save big on all premium design templates. Click the link to claim your code. Offer expires within 24 hours.`,
    date: '08 Nov, 11:15 AM',
    timestamp: new Date('2026-11-08T11:15:00').getTime(),
    folder: 'trash',
    isUnread: false,
    starred: false,
    avatarColor: '#ef4444',
    avatarLetter: 'O',
    attachments: [],
    replies: []
  }
];

export const EmailProvider = ({ children }) => {
  const [emails, setEmails] = useState(() => {
    const auth = localStorage.getItem('qrypt_authenticated') === 'true';
    const isDemo = localStorage.getItem('qrypt_is_demo');
    if (auth && isDemo === 'false') {
      return [];
    }
    return initialEmails;
  });
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState(() => {
    const auth = localStorage.getItem('qrypt_authenticated') === 'true';
    const isDemo = localStorage.getItem('qrypt_is_demo');
    if (auth && isDemo === 'false') {
      return null;
    }
    return '1';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, read, unread

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  // Theme Management (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('qrypt_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qrypt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qrypt_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // App Auth state & config
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('qrypt_authenticated') === 'true';
  });
  
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const auth = localStorage.getItem('qrypt_authenticated') === 'true';
    const val = localStorage.getItem('qrypt_is_demo');
    if (auth && val === null) {
      return false;
    }
    return val !== 'false';
  });

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('qrypt_app_token') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('qrypt_user_email') || 'byl.t@qryptmail.com');
  const [userName, setUserName] = useState(() => localStorage.getItem('qrypt_user_name') || 'Byl Thalassa');
  const [userId, setUserId] = useState(() => localStorage.getItem('qrypt_user_id') || '');
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);

  // Keep these as dummy values/aliases for compatibility with UI components
  const dsn = BASE_URL;
  const accountId = 'default';

  // Helper: parse display name and email from "From" header
  const parseFromHeader = (fromStr) => {
    if (!fromStr) return { name: 'Unknown', email: '' };
    const match = fromStr.match(/^(.*?)\s*<([^>]+)>/);
    if (match) {
      return {
        name: match[1].replace(/['"]/g, '').trim() || match[2].split('@')[0],
        email: match[2].trim()
      };
    }
    return {
      name: fromStr.split('@')[0],
      email: fromStr.trim()
    };
  };

  // Helper: format relative date
  const formatDateRelative = (timestamp) => {
    const d = new Date(timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  // Helper: string to color generator
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#0acf83', '#24292f', '#0077b5', '#1ed760', '#ec4899', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444'];
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  // Helper: format bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Fetch emails from the email-server backend
  const fetchEmails = async (loadMore = false) => {
    if (isDemoMode || !apiKey) {
      return;
    }
    setIsLoadingEmails(true);
    try {
      const pageTokenQuery = loadMore && nextPageToken ? `&pageToken=${encodeURIComponent(nextPageToken)}` : '';
      const response = await fetch(`${BASE_URL}/api/mail/inbox?email=${encodeURIComponent(userEmail)}&folder=${encodeURIComponent(activeFolder)}&limit=20${pageTokenQuery}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const json = await response.json();
      const itemsList = json.data?.messages || [];
      const newNextPageToken = json.data?.nextPageToken || null;
      setNextPageToken(newNextPageToken);

      if (itemsList) {
        const normalized = itemsList.map(msg => {
          const parsedFrom = parseFromHeader(msg.from);
          const timestamp = new Date(msg.date).getTime() || Date.now();
          const dateStr = formatDateRelative(timestamp);
          
          return {
            id: msg.id,
            sender: parsedFrom.name,
            email: parsedFrom.email,
            to: userEmail,
            subject: msg.subject || '(No Subject)',
            snippet: msg.snippet || '',
            body: msg.snippet || '',
            isFullBodyLoaded: false,
            date: dateStr,
            timestamp: timestamp,
            folder: activeFolder,
            isUnread: msg.isUnread !== undefined ? msg.isUnread : false,
            starred: msg.starred !== undefined ? msg.starred : activeFolder === 'starred',
            avatarColor: stringToColor(parsedFrom.name || parsedFrom.email),
            avatarLetter: (parsedFrom.name || parsedFrom.email || 'U').slice(0, 2).toUpperCase(),
            attachments: [],
            replies: [],
            hasAttachments: msg.hasAttachments || false,
            attachmentCount: msg.attachmentCount || 0
          };
        });

        // Sort by timestamp descending
        normalized.sort((a, b) => b.timestamp - a.timestamp);

        setEmails(prev => {
          if (loadMore) {
            // Append and filter out duplicates
            const combined = [...prev, ...normalized];
            const unique = combined.filter((item, index, self) => 
              self.findIndex(t => t.id === item.id) === index
            );
            unique.sort((a, b) => b.timestamp - a.timestamp);
            return unique;
          } else {
            // Overwrite list but preserve loaded details (body, isFullBodyLoaded, attachments, replies)
            return normalized.map(newEmail => {
              const existing = prev.find(e => e.id === newEmail.id);
              if (existing && existing.isFullBodyLoaded) {
                return {
                  ...newEmail,
                  body: existing.body,
                  isFullBodyLoaded: true,
                  attachments: existing.attachments || [],
                  replies: existing.replies || []
                };
              }
              return newEmail;
            });
          }
        });
      }
    } catch (err) {
      console.error("Error fetching emails from server:", err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // Run sync when active folder changes or credentials load
  useEffect(() => {
    if (!isDemoMode && isAuthenticated) {
      setNextPageToken(null);
      fetchEmails(false);
    }
  }, [activeFolder, isDemoMode, isAuthenticated, userEmail, apiKey]);

  // Auto-select first email in current folder if selection not in this folder
  useEffect(() => {
    const currentFolderEmails = getFilteredEmails();
    if (currentFolderEmails.length > 0) {
      const match = currentFolderEmails.find(m => m.id === selectedEmailId);
      if (!match) {
        setSelectedEmailId(currentFolderEmails[0].id);
      }
    } else {
      setSelectedEmailId(null);
    }
  }, [activeFolder, emails]);

  const getFilteredEmails = () => {
    return emails.filter(email => {
      // Folder filter
      if (activeFolder === 'starred') {
        if (!email.starred || email.folder === 'trash') return false;
      } else if (email.folder !== activeFolder) {
        return false;
      }

      // Read/Unread filter
      if (filter === 'read' && email.isUnread) return false;
      if (filter === 'unread' && !email.isUnread) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const subjectMatch = email.subject?.toLowerCase().includes(query);
        const senderMatch = email.sender?.toLowerCase().includes(query);
        const bodyMatch = email.body?.toLowerCase().includes(query);
        return subjectMatch || senderMatch || bodyMatch;
      }

      return true;
    });
  };

  const getSelectedEmail = () => {
    return emails.find(email => email.id === selectedEmailId);
  };

  const markAsRead = async (id) => {
    const target = emails.find(e => e.id === id);
    if (!target || !target.isUnread) return;

    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, isUnread: false } : email
    ));

    // Note: server doesn't support mark as read (Gap documented)
  };

  const selectEmail = async (id) => {
    setSelectedEmailId(id);
    markAsRead(id);

    if (isDemoMode) return;

    // Check if body is already fully loaded
    const current = emails.find(e => e.id === id);
    if (current && current.isFullBodyLoaded) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/mail/messages/${id}?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch message body: ${response.status}`);
      }
      const json = await response.json();
      const message = json.data?.message;
      if (message) {
        setEmails(prev => prev.map(email => {
          if (email.id === id) {
            return {
              ...email,
              body: message.body || email.snippet || '',
              cc: message.cc || '',
              bcc: message.bcc || '',
              isFullBodyLoaded: true,
              attachments: (message.attachments || []).map(att => ({
                id: att.id,
                name: att.filename || 'file',
                size: formatBytes(att.size || 0),
                type: att.mimeType || 'application/octet-stream'
              }))
            };
          }
          return email;
        }));
      }
    } catch (err) {
      console.error("Error loading email body from server:", err);
    }
  };

  const toggleStar = async (id) => {
    const target = emails.find(e => e.id === id);
    if (!target) return;
    const newStarred = !target.starred;

    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, starred: newStarred } : email
    ));

    // Note: server doesn't support starring (Gap documented)
  };

  const deleteEmail = async (id) => {
    const target = emails.find(e => e.id === id);
    if (!target) return;

    setEmails(prev => prev.map(email => {
      if (email.id === id) {
        if (email.folder === 'trash') {
          return null;
        } else {
          return { ...email, folder: 'trash' };
        }
      }
      return email;
    }).filter(Boolean));
    setSelectedEmailId(null);

    // Note: server doesn't support deleting/trashing (Gap documented)
  };

  const sendEmail = async (to, subject, body, cc = '', bcc = '', attachments = []) => {
    const parseRecipients = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(',').map(e => e.trim()).filter(Boolean);
    };

    const parsedTo = parseRecipients(to);
    const parsedCc = parseRecipients(cc);
    const parsedBcc = parseRecipients(bcc);

    if (isDemoMode) {
      const newMail = {
        id: `s-${Date.now()}`,
        sender: userName,
        email: userEmail,
        to,
        cc,
        bcc,
        subject,
        body,
        date: 'Just Now',
        timestamp: Date.now(),
        folder: 'sent',
        isUnread: false,
        starred: false,
        avatarColor: '#5925dc',
        avatarLetter: userName.slice(0, 2).toUpperCase(),
        attachments: attachments.map((att, i) => ({
          id: `att-s-${i}-${Date.now()}`,
          name: att.filename,
          size: formatBytes(att.size || 0),
          type: att.mimeType
        })),
        replies: [],
        isFullBodyLoaded: true
      };
      setEmails(prev => [newMail, ...prev]);
      setActiveFolder('sent');
      setSelectedEmailId(newMail.id);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          to: parsedTo,
          cc: parsedCc,
          bcc: parsedBcc,
          subject,
          body,
          attachments
        })
      });
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errorMsg = errorJson.error?.message || errorJson.message || `Server error: ${response.status}`;
        throw new Error(errorMsg);
      }
      setActiveFolder('sent');
      fetchEmails();
    } catch (err) {
      console.error("Error sending email via server:", err);
      alert("Error sending email: " + err.message);
    }
  };

  const saveDraft = async (to, subject, body) => {
    const newDraft = {
      id: `d-${Date.now()}`,
      sender: userName,
      email: userEmail,
      to,
      subject,
      body,
      date: 'Just Now',
      timestamp: Date.now(),
      folder: 'drafts',
      isUnread: false,
      starred: false,
      avatarColor: '#64748b',
      avatarLetter: 'D',
      attachments: [],
      replies: []
    };
    setEmails(prev => [newDraft, ...prev]);
    setActiveFolder('drafts');
    setSelectedEmailId(newDraft.id);

    // Note: server doesn't support saving drafts (Gap documented)
  };

  const addReply = async (emailId, replyText) => {
    if (isDemoMode) {
      setEmails(prev => prev.map(email => {
        if (email.id === emailId) {
          const newReply = {
            id: `r-${Date.now()}`,
            sender: userName,
            email: userEmail,
            body: replyText,
            date: 'Just Now',
            timestamp: Date.now()
          };
          return {
            ...email,
            replies: [...(email.replies || []), newReply]
          };
        }
        return email;
      }));
      return;
    }

    try {
      const original = emails.find(e => e.id === emailId);
      if (!original) return;
      
      const response = await fetch(`${BASE_URL}/api/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          to: [original.email],
          subject: original.subject.startsWith('Re:') ? original.subject : `Re: ${original.subject}`,
          body: replyText
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send reply");
      }
      
      const newReply = {
        id: `r-${Date.now()}`,
        sender: userName,
        email: userEmail,
        body: replyText,
        date: 'Just Now',
        timestamp: Date.now()
      };
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, replies: [...(email.replies || []), newReply] } : email
      ));
    } catch (err) {
      console.error("Error sending reply via server:", err);
    }
  };

  const loginDemo = () => {
    setIsDemoMode(true);
    setIsAuthenticated(true);
    localStorage.setItem('qrypt_is_demo', 'true');
    localStorage.setItem('qrypt_authenticated', 'true');
    localStorage.setItem('qrypt_user_email', 'byl.t@qryptmail.com');
    localStorage.setItem('qrypt_user_name', 'Byl Thalassa');
    setUserEmail('byl.t@qryptmail.com');
    setUserName('Byl Thalassa');
    setEmails(initialEmails);
  };

  // Maps to Unipile style parameters for backwards compatibility with Login.jsx if needed,
  // or customized for server-based redirects.
  const loginUnipile = (token, emailVal, nameVal, idVal) => {
    setIsDemoMode(false);
    setApiKey(token);
    setUserEmail(emailVal);
    setUserName(nameVal || 'User');
    setUserId(idVal || '');
    setIsAuthenticated(true);

    localStorage.setItem('qrypt_is_demo', 'false');
    localStorage.setItem('qrypt_app_token', token);
    localStorage.setItem('qrypt_user_email', emailVal);
    localStorage.setItem('qrypt_user_name', nameVal || 'User');
    localStorage.setItem('qrypt_user_id', idVal || '');
    localStorage.setItem('qrypt_authenticated', 'true');
  };

  const downloadAttachment = async (messageId, attachmentId, filename) => {
    try {
      const response = await fetch(`${BASE_URL}/api/mail/messages/${messageId}/attachments/${attachmentId}?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (!response.ok) throw new Error("Failed to download attachment");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading attachment:", err);
      alert("Error downloading attachment: " + err.message);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsDemoMode(true);
    setApiKey('');
    setUserEmail('byl.t@qryptmail.com');
    setUserName('Byl Thalassa');
    setUserId('');
    setEmails(initialEmails);

    localStorage.removeItem('qrypt_app_token');
    localStorage.removeItem('qrypt_user_email');
    localStorage.removeItem('qrypt_user_name');
    localStorage.removeItem('qrypt_user_id');
    localStorage.removeItem('qrypt_authenticated');
    localStorage.removeItem('qrypt_is_demo');
  };

  const getUnreadCount = (folderName) => {
    return emails.filter(email => email.folder === folderName && email.isUnread).length;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.onAuthCallback) {
      window.electronAPI.onAuthCallback((url) => {
        try {
          console.log('Received auth callback URL inside Electron:', url);
          const parsedUrl = new URL(url);
          const params = parsedUrl.searchParams;
          const success = params.get('success');
          const failure = params.get('failure');
          const errorMsg = params.get('error');

          if (success === 'true') {
            const appToken = params.get('appToken');
            const email = params.get('email');
            const name = params.get('name');
            const userId = params.get('userId');
            if (appToken && email) {
              loginUnipile(appToken, email, name, userId);
            }
          } else if (failure === 'true') {
            console.error('OAuth callback failed inside Electron:', errorMsg);
          }
        } catch (err) {
          console.error('Failed to parse Electron auth callback URL:', err);
        }
      });
    }
  }, []);

  return (
    <EmailContext.Provider value={{
      emails,
      activeFolder,
      setActiveFolder,
      selectedEmailId,
      setSelectedEmailId,
      searchQuery,
      setSearchQuery,
      filter,
      setFilter,
      getFilteredEmails,
      getSelectedEmail,
      selectEmail,
      toggleStar,
      deleteEmail,
      sendEmail,
      saveDraft,
      addReply,
      getUnreadCount,
      
      // Auth states & methods
      isAuthenticated,
      isDemoMode,
      dsn,
      apiKey,
      accountId,
      userEmail,
      userName,
      userId,
      isLoadingEmails,
      loginDemo,
      loginUnipile,
      logout,
      fetchEmails,
      nextPageToken,
      // Theme settings
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmails = () => useContext(EmailContext);
