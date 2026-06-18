// Vercel Serverless Function — Save a JSON data file to GitHub repo
// Route: POST /api/save
// Body: { filename: string, data: object }

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const correctPassword = process.env.ADMIN_PASSWORD || 'Jita2025';

  if (token !== correctPassword) {
    return res.status(401).json({ error: 'Unauthorized: Invalid credentials.' });
  }

  const { filename, data } = req.body;

  if (!filename || data === undefined || data === null) {
    return res.status(400).json({ error: 'Missing filename or data payload.' });
  }

  if (!SAFE_FILES.includes(filename)) {
    return res.status(400).json({ error: 'Unauthorized write destination.' });
  }

  const token  = process.env.GITHUB_TOKEN;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    return res.status(500).json({ error: 'Server configuration error: GitHub credentials missing.' });
  }

  const apiUrl = `https://api.github.com/repos/${repo}/contents/data/${filename}`;

  try {
    // Step 1: Get the current file SHA (required by GitHub API to update a file)
    let sha = null;
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (getRes.ok) {
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
    } else if (getRes.status !== 404) {
      // 404 means new file (ok), anything else is a real error
      const errBody = await getRes.json();
      throw new Error(errBody.message || `GitHub read error: ${getRes.status}`);
    }

    // Step 2: Encode the new content as base64
    const formattedJson = JSON.stringify(data, null, 2);
    const encodedContent = Buffer.from(formattedJson, 'utf8').toString('base64');

    // Step 3: Commit the updated file
    const putBody = {
      message: `CMS: Update ${filename}`,
      content: encodedContent,
      branch
    };
    if (sha) putBody.sha = sha; // Required for update; omit for new file

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) {
      const errBody = await putRes.json();
      throw new Error(errBody.message || `GitHub write error: ${putRes.status}`);
    }

    console.log(`[api/save] Successfully committed: data/${filename}`);
    res.status(200).json({ success: true, message: `Successfully updated ${filename}` });
  } catch (err) {
    console.error(`[api/save] Error saving ${filename}:`, err.message);
    res.status(500).json({ error: err.message });
  }
};
