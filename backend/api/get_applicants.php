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
$sortBy = $_GET['sortBy'] ?? 'created_at';
$sortDir = strtoupper($_GET['sortDir'] ?? 'DESC');
$lang = $_GET['lang'] ?? 'de';

$allowedSortFields = ['created_at', 'last_name', 'first_name', 'email'];
$allowedSortDirections = ['ASC', 'DESC'];

$sortField = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
$sortDirection = in_array($sortDir, $allowedSortDirections) ? $sortDir : 'DESC';

$params = [];
$whereParts = [];

// Suche filtern
if ($search !== '') {
    $whereParts[] = '(a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ? OR jt.title LIKE ?)';
    $searchWildcard = '%' . $search . '%';
    $params[] = $searchWildcard;
    $params[] = $searchWildcard;
    $params[] = $searchWildcard;
    $params[] = $searchWildcard;
}

// Favoriten-Filter
$favoriteOnly = isset($_GET['favoriteOnly']) && $_GET['favoriteOnly'] === '1';
if ($favoriteOnly) {
    $whereParts[] = 'a.is_favorite = 1';
}

$whereClause = '';
if (!empty($whereParts)) {
    $whereClause = 'WHERE ' . implode(' AND ', $whereParts);
}

// --- SQL mit JOIN auf Jobübersetzungen für Job Titel in aktueller Sprache ---
$sql = "
SELECT 
  a.id,
  a.job_id,
  jt.title AS job_title,
  a.first_name,
  a.last_name,
  a.email,
  a.phone,
  a.message,
  a.cv_path,
  a.is_favorite,
  a.created_at
FROM tbl_applicants a
LEFT JOIN tbl_job_translations jt ON a.job_id = jt.job_id AND jt.lang = ?
$whereClause
ORDER BY $sortField $sortDirection
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
    error_log('Fehler beim Vorbereiten der SQL-Anweisung');
    exit;
}

// --- Parameter binden: Zuerst Language (string), dann Such-Parameter (strings) ---
$types = 's' . str_repeat('s', count($params));
$bindParams = array_merge([$lang], $params);

// --- Dynamisch binden mit ... (unpacking) ---
$stmt->bind_param($types, ...$bindParams);

// --- Ausführen ---
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
    error_log('Fehler beim Ausführen der SQL-Anfrage');
    exit;
}

$result = $stmt->get_result();
$applicants = [];

while ($row = $result->fetch_assoc()) {
    $row['is_favorite'] = (bool) $row['is_favorite'];
    $applicants[] = $row;
}

echo json_encode($applicants, JSON_UNESCAPED_UNICODE);
$stmt->close();
$conn->close();
?>