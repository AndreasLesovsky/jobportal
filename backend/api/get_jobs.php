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
$lang = $_GET['lang'] ?? 'de';
$search = isset($_GET['q']) ? trim($_GET['q']) : '';
$sortBy = $_GET['sortBy'] ?? 'created_at';
$sortDir = strtoupper($_GET['sortDir'] ?? 'DESC');

$allowedSortFields = ['created_at', 'title', 'location', 'salary'];
$allowedSortDirections = ['ASC', 'DESC'];

$sortField = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
$sortDirection = in_array($sortDir, $allowedSortDirections) ? $sortDir : 'DESC';

$params = [];
$whereParts = ["t.lang = ?"];
$params[] = $lang;

// --- Suche filtern ---
if ($search !== '') {
    $whereParts[] = "(t.title LIKE ? OR t.description LIKE ? OR t.location LIKE ?)";
    $searchWildcard = '%' . $search . '%';
    $params[] = $searchWildcard;
    $params[] = $searchWildcard;
    $params[] = $searchWildcard;
}

// --- Nur aktive Jobs ---
$activeOnly = isset($_GET['activeOnly']) && $_GET['activeOnly'] === '1';
if ($activeOnly) {
    $whereParts[] = "j.is_active = 1";
}

$whereClause = 'WHERE ' . implode(' AND ', $whereParts);

// --- SQL-Abfrage ---
$query = "
SELECT 
    j.id,
    j.is_active,
    j.created_at,
    t.lang,
    t.title,
    t.location,
    t.description,
    t.details,
    t.salary
FROM 
    tbl_jobs j
JOIN 
    tbl_job_translations t ON j.id = t.job_id
$whereClause
ORDER BY 
    $sortField $sortDirection
";

// --- Ausführen ---
$stmt = $conn->prepare($query);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
    error_log('Fehler beim Vorbereiten der SQL-Anweisung');
    exit;
}

// --- Bind Types: erstes param ist lang = string, Rest abhängig von search ---
$typeStr = str_repeat('s', count($params));
$stmt->bind_param($typeStr, ...$params);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error']);
    error_log('Fehler beim Ausführen der SQL-Anfrage');
    exit;
}

$result = $stmt->get_result();
$jobs = [];

while ($row = $result->fetch_assoc()) {
    $row['is_active'] = (bool) $row['is_active'];
    $jobs[] = $row;
}

echo json_encode($jobs, JSON_UNESCAPED_UNICODE);
$stmt->close();
$conn->close();
?>