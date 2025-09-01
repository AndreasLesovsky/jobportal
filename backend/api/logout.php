<?php
session_start();
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/cors.inc.php';
handle_cors(
    CORS_ORIGINS,
    ['POST', 'OPTIONS'],
    ['Content-Type']
);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    session_unset();
    session_destroy();

    echo json_encode(['success' => true]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    error_log('Nur POST erlaubt');
}
?>