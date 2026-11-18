const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname, 'bak');

app.use(express.static(STATIC_DIR));

app.use((req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BAK static server listening on http://0.0.0.0:${PORT}`);
});
