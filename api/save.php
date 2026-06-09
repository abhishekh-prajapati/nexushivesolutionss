<?php
/**
 * NexusHive CMS — Data Writer
 * Route: POST /api/save  (via .htaccess rewrite)
 * Writes JSON data directly to the /data/ directory on the server.
 * No GitHub token needed — files live on MilesWeb directly.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

// Parse JSON body
$body = file_get_contents('php://input');
$payload = json_decode($body, true);

if (json_last_error() !== JSON_ERROR_NONE || !isset($payload['filename']) || !isset($payload['data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing filename or data payload.']);
    exit;
}

$filename = basename($payload['filename']);
$data     = $payload['data'];

$SAFE_FILES = [
    'hero.json',
    'services.json',
    'events.json',
    'testimonials.json',
    'about.json',
    'resources.json',
    'glossary.json',
    'tips.json'
];

if (!in_array($filename, $SAFE_FILES)) {
    http_response_code(400);
    echo json_encode(['error' => 'Unauthorized write destination.']);
    exit;
}

$filePath   = __DIR__ . '/../data/' . $filename;
$formatted  = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($formatted === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to encode JSON data.']);
    exit;
}

// Atomic write: write to temp file then rename to avoid corruption
$tmpPath = $filePath . '.tmp';
$written = file_put_contents($tmpPath, $formatted, LOCK_EX);

if ($written === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write data file. Check server folder permissions.']);
    exit;
}

rename($tmpPath, $filePath);

echo json_encode(['success' => true, 'message' => "Successfully updated $filename"]);
