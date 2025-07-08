const express = require('express');
const router = express.Router();

// Placeholder auth routes (נפתח בשלבים הבאים)
router.post('/register', (req, res) => {
  res.json({
    message: 'Register endpoint - Coming soon!',
    status: 'placeholder'
  });
});

router.post('/login', (req, res) => {
  res.json({
    message: 'Login endpoint - Coming soon!',
    status: 'placeholder'
  });
});

router.post('/logout', (req, res) => {
  res.json({
    message: 'Logout endpoint - Coming soon!',
    status: 'placeholder'
  });
});

module.exports = router;
