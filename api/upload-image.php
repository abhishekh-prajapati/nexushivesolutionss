<?php
/**
 * NexusHive CMS — Image Uploader
 * Route: POST /api/upload-image  (via .htaccess rewrite)
 * Accepts base64-encoded image, saves to /img/ directory.
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

$body    = file_get_contents('php://input');
$payload = json_decode($body, true);

if (json_last_error() !== JSON_ERROR_NONE || empty($payload['base64Data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing base64 data payload.']);
    exit;
}

$base64Data = $payload['base64Data'];
$extension  = isset($payload['extension']) ? strtolower(preg_replace('/[^a-z]/', '', $payload['extension'])) : 'png';

$ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp'];
if (!in_array($extension, $ALLOWED_EXTENSIONS)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid image format type.']);
    exit;
}

// Strip data URI prefix if present
$base64Clean = preg_replace('/^data:image\/\w+;base64,/', '', $base64Data);
$imageData   = base64_decode($base64Clean);

if ($imageData === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid base64 encoding.']);
    exit;
}

$imgDir  = __DIR__ . '/../img/';
if (!is_dir($imgDir)) {
    mkdir($imgDir, 0755, true);
}

$filename = 'upload_' . time() . '_' . rand(1000, 9999) . '.' . $extension;
$filePath = $imgDir . $filename;

if (file_put_contents($filePath, $imageData) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save image. Check img/ folder permissions.']);
    exit;
}

echo json_encode(['success' => true, 'filePath' => 'img/' . $filename]);
