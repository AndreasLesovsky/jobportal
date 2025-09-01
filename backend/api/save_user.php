<?php
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/cors.inc.php';
handle_cors(
    CORS_ORIGINS,
    ['POST', 'OPTIONS'],
    ['Content-Type']
);
require_once __DIR__ . '/../includes/common.inc.php';
require_once __DIR__ . '/../includes/db.inc.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    error_log('Nur POST erlaubt');
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$role_id = (int)($_POST['role_id'] ?? 0);
$password = $_POST['password'] ?? null;

if (!$username || !$email || !$role_id || ($id === 0 && !$password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bad Request']);
    error_log('Fehlende Formularfelder');
    exit;
}

$conn = dbConnect();

if ($id > 0) {
    // --- UPDATE ---
    if ($password) {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $sql = "UPDATE tbl_users SET username=?, email=?, role_id=?, password_hash=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
            error_log('Statement-Vorbereitung fehlgeschlagen');
            exit;
        }
        $stmt->bind_param('ssisi', $username, $email, $role_id, $passwordHash, $id);
    } else {
        $sql = "UPDATE tbl_users SET username=?, email=?, role_id=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
            error_log('Statement-Vorbereitung fehlgeschlagen');
            exit;
        }
        $stmt->bind_param('ssii', $username, $email, $role_id, $id);
    }

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Update fehlgeschlagen');
        exit;
    }

    echo json_encode(['success' => true, 'action' => 'updated']);
} else {
    // --- CREATE ---
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $sql = "INSERT INTO tbl_users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Statement-Vorbereitung fehlgeschlagen');
        exit;
    }

    $stmt->bind_param('sssi', $username, $email, $passwordHash, $role_id);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["success" => false, 'error' => 'Internal Server Error']);
        error_log('Insert fehlgeschlagen');
        exit;
    }

    echo json_encode(['success' => true, 'action' => 'created', 'id' => $stmt->insert_id]);
}

$stmt->close();
$conn->close();
?>