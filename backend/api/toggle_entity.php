<?php
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

$conn = dbConnect();
$data = json_decode(file_get_contents('php://input'), true);

$table = $data['table'] ?? null;
$id = $data['id'] ?? null;
$value = $data['value'] ?? null;
$field = $data['field'] ?? null;

$allowedTables = ['tbl_jobs', 'tbl_applicants'];
$allowedFields = ['is_active', 'is_favorite'];

if (
    !$table || !$id || $value === null || !$field ||
    !in_array($table, $allowedTables, true) ||
    !in_array($field, $allowedFields, true)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bad Request']);
    error_log('Fehlende oder ungültige Felder');
    exit;
}

$stmt = $conn->prepare("UPDATE $table SET $field = ? WHERE id = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Statement preparation failed']);
    error_log('Statement preparation failed');
    $conn->close();
    exit;
}

$stmt->bind_param("ii", $value, $id);
$success = $stmt->execute();

$stmt->close();
$conn->close();

echo json_encode(['success' => (bool)$success]);
?>