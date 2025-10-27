const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(express.static('public', { extensions: ['html'], index: false }));

app.use(session({
  secret: 'factory_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Admin route, protected
app.get('/admin', (req, res) => {
  if (req.session.user === 'admin') {
    res.sendFile(path.join(__dirname, 'public/apcsp/andrewe/product-generator/index.html'));
  } else {
    res.status(403).send('<h2>⛔ Access Denied. You must be admin to view this page.</h2>');
  }
});

// Simple route to set admin mode (manual "login" for testing)
app.get('/set-admin', (req, res) => {
  req.session.user = 'admin';
  res.send('<h2>Admin mode enabled. Go to <a href="/admin">Admin Page</a></h2>');
});

// Simple route to clear session (logout)
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('<h2>Logged out. Go to <a href="/">Home</a></h2>');
  });
});

// API route to check if logged in as admin
app.get('/api/check-login', (req, res) => {
  res.json({ isAdmin: req.session.user === 'admin' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
