<?php
/**
 * NexusHive CMS — Data Reader
 * Route: GET /api/data/:filename  (via .htaccess rewrite)
 * Serves JSON data files from the /data/ directory safely.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

// Accept filename from query string: ?file=hero.json
$filename = isset($_GET['file']) ? basename($_GET['file']) : '';

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

if (empty($filename) || !in_array($filename, $SAFE_FILES)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing file parameter.']);
    exit;
}

$filePath = __DIR__ . '/../data/' . $filename;

if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => "File not found: $filename"]);
    exit;
}

$content = file_get_contents($filePath);
if ($content === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read data file.']);
    exit;
}

// Validate JSON before sending
json_decode($content);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Corrupted JSON in data file.']);
    exit;
}

echo $content;
