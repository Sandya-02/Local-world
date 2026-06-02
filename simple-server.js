const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Fallback to index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Static server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/index.html to view your site`);
});
