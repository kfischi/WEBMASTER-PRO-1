const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

console.log('Starting WebMaster Pro Backend...');

app.get('/', (req, res) => {
  res.json({ 
    message: 'WebMaster Pro Backend',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
