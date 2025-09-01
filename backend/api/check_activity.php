<?php
session_start();
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/cors.inc.php';
handle_cors(
    CORS_ORIGINS,
    ['GET', 'OPTIONS'],
    ['Content-Type']
);
require_once __DIR__ . '/../includes/common.inc.php';
require_once __DIR__ . '/../includes/db.inc.php';
header("Content-Type: application/json");
$sessionLifetime = 1440;
$now = time();
$conn = dbConnect();

// --- User-ID im $_SESSION Array prüfen ---
if (!isset($_SESSION['id'])) {
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    error_log('User ID ist nicht mehr im $_SESSION Array vorhanden.');
    exit;
}

// --- Existiert User noch in DB? ---
$stmt = $conn->prepare("SELECT id FROM tbl_users WHERE id = ?");
$stmt->bind_param("i", $_SESSION['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    error_log('Ungültige Session: User existiert nicht mehr.');
    exit;
}
$stmt->close();

// --- Restliche Session-Checks ---
if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true ||
    !isset($_SESSION['last_activity']) ||
    ($now - $_SESSION['last_activity'] > $sessionLifetime) ||
    !isset($_SESSION['role'])
) {
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    error_log('Session abgelaufen oder ungültig');
    exit;
}

// --- Session verlängern ---
$_SESSION['last_activity'] = $now;

echo json_encode([
    'success' => true,
    'message' => 'Session aktiv.',
    'role' => $_SESSION['role'] ?? null
]);
