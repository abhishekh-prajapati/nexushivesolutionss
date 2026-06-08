// Vercel Serverless Function — Read a JSON data file from GitHub repo
// Route: GET /api/data/:filename

const SAFE_FILES = [
  'hero.json',
  'services.json',
  'events.json',
  'testimonials.json',
  'about.json',
  'resources.json',
  'glossary.json',
  'tips.json'
];

module.exports = async function handler(req, res) {
  // Allow CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { filename } = req.query;

  if (!SAFE_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Invalid file request.' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    return res.status(500).json({ error: 'Server configuration error: GitHub credentials missing.' });
  }

  try {
    const url = `https://api.github.com/repos/${repo}/contents/data/${filename}?ref=${branch}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) {
      const errBody = await response.json();
      throw new Error(errBody.message || `GitHub API error: ${response.status}`);
    }

    const fileData = await response.json();
    // GitHub returns file content as base64 encoded string
    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(content);
  } catch (err) {
    console.error(`[api/data/${filename}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
};
