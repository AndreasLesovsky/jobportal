<?php
session_start();
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/cors.inc.php';
handle_cors(
    CORS_ORIGINS,
    ['POST', 'OPTIONS'],
    ['Content-Type', 'X-Requested-With']
);
require_once __DIR__ . '/../includes/common.inc.php';
require_once __DIR__ . '/../includes/db.inc.php';
header('Content-Type: application/json');

// --- Nur eingeloggte User dürfen löschen ---
if (!isset($_SESSION['logged_in'], $_SESSION['role']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    error_log('Nicht eingeloggt');
    exit;
}

if (!in_array($_SESSION['role'], ['admin', 'superadmin', 'hr'], true)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    error_log('Keine Berechtigung');
    exit;
}

// --- POST-Parameter prüfen ---
$table = $_POST['table'] ?? '';
$id = $_POST['id'] ?? null;

$allowed_tables = [
    'tbl_applicants',
    'tbl_users',
    'tbl_jobs'
];

if (!in_array($table, $allowed_tables, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bad Request']);
    error_log('Ungültiger Tabellenname');
    exit;
}

if (!$id || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bad Request']);
    error_log('Fehlende oder ungültige ID');
    exit;
}

// --- DB-Verbindung öffnen ---
$conn = dbConnect();

// --- Prüfen ob der eingeloggte User sich selbst löschen will ---
if ($table === 'tbl_users' && isset($_SESSION['id'])) {
    $currentUserId = (int)$_SESSION['id'];
    $targetUserId = (int)$id;
    
    if ($currentUserId === $targetUserId) {
        http_response_code(403);
        echo json_encode(['success' => false, 'errorType' => 'deleteLoggedInUser']);
        $conn->close();
        exit;
    }
}

// --- Superadmin darf nicht gelöscht werden (nur bei tbl_users relevant) ---
if ($table === 'tbl_users') {
    $stmt = $conn->prepare("
        SELECT u.role_id
        FROM tbl_users u
        WHERE u.id = ?
    ");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Statement-Vorbereitung fehlgeschlagen');
        $conn->close();
        exit;
    }

    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Statement-Ausführung fehlgeschlagen');
        $stmt->close();
        $conn->close();
        exit;
    }

    $stmt->bind_result($roleId);
    $stmt->fetch();
    $stmt->close();

    if ((int)$roleId === SUPER_ADMIN_ID) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        error_log('Superadmin darf nicht gelöscht werden');
        $conn->close();
        exit;
    }
}

// --- Vor dem Löschen prüfen, ob ein Job Bewerber hat ---
if ($table === 'tbl_jobs') {
    $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM tbl_applicants WHERE job_id = ?");
    if (!$stmtCheck) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Statement-Vorbereitung fehlgeschlagen');
        $conn->close();
        exit;
    }

    $stmtCheck->bind_param('i', $id);
    if (!$stmtCheck->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Statement-Ausführung fehlgeschlagen');
        $stmtCheck->close();
        $conn->close();
        exit;
    }

    $stmtCheck->bind_result($countApplicants);
    $stmtCheck->fetch();
    $stmtCheck->close();

    if ($countApplicants > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errorType' => 'existingApplicantForJobId']);
        $conn->close();
        exit;
    }
}

// --- DB-Löschung ---
$stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
    error_log('Statement-Vorbereitung fehlgeschlagen');
    $conn->close();
    exit;
}

$stmt->bind_param('i', $id);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
    error_log('Statement-Ausführung fehlgeschlagen');
    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode(['success' => true]);
$stmt->close();
$conn->close();
?>