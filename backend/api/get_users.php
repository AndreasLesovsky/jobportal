<?php
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/cors.inc.php';
handle_cors(
    CORS_ORIGINS,
    ['GET', 'OPTIONS'],
    ['Content-Type']
);
require_once __DIR__ . '/../includes/common.inc.php';
require_once __DIR__ . '/../includes/db.inc.php';
header('Content-Type: application/json');
$conn = dbConnect();

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
    error_log('Verbindung zur Datenbank fehlgeschlagen');
    exit;
}

// --- Filter & Sortierung vorbereiten ---
$search = isset($_GET['q']) ? trim($_GET['q']) : '';
$roleFilter = isset($_GET['role']) ? trim($_GET['role']) : '';
$sortBy = $_GET['sortBy'] ?? 'created_at';
$sortDir = strtoupper($_GET['sortDir'] ?? 'DESC');

$allowedSortFields = ['created_at', 'username', 'email', 'role_name'];
$allowedSortDirections = ['ASC', 'DESC'];

$sortField = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
$sortDirection = in_array($sortDir, $allowedSortDirections) ? $sortDir : 'DESC';

$params = [];
$whereParts = [];

// --- Suche filtern ---
if ($search !== '') {
    $whereParts[] = '(u.username LIKE ? OR u.email LIKE ? OR r.name LIKE ?)';
    $searchWildcard = '%' . $search . '%';
    $params[] = $searchWildcard;
    $params[] = $searchWildcard;
    $params[] = $searchWildcard;
}

if ($roleFilter !== '') {
    $whereParts[] = 'r.name = ?';
    $params[] = $roleFilter;
}

$whereClause = '';
if (!empty($whereParts)) {
    $whereClause = 'WHERE ' . implode(' AND ', $whereParts);
}

// --- SQL-Abfrage ---
$userQuery = "
SELECT 
  u.id,
  u.username,
  u.email,
  u.created_at,
  u.role_id,
  r.name AS role_name
FROM 
  tbl_users u
INNER JOIN 
  tbl_roles r ON u.role_id = r.id
$whereClause
ORDER BY 
  $sortField $sortDirection
";

// --- Ausführen ---
$stmt = $conn->prepare($userQuery);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
    error_log('Fehler beim Vorbereiten der SQL-Anweisung');
    exit;
}

if (!empty($params)) {
    $stmt->bind_param(str_repeat('s', count($params)), ...$params);
}

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
    error_log('Fehler beim Ausführen der SQL-Anfrage');
    exit;
}

$result = $stmt->get_result();
$users = [];

while ($row = $result->fetch_assoc()) {
    $isSuperAdmin = ((int)$row['role_id'] === SUPER_ADMIN_ID);
    $users[] = [
        'id' => (int) $row['id'],
        'username' => $row['username'],
        'email' => $row['email'],
        'created_at' => $row['created_at'],
        'role_id' => $isSuperAdmin ? 1 : (int)$row['role_id'], // Superadmin maskieren
        'role_name' => $row['role_name'] ?? 'Unbekannt'
    ];
}

echo json_encode($users, JSON_UNESCAPED_UNICODE);
$stmt->close();
$conn->close();
?>