<?php
require_once __DIR__ . '/../includes/common.inc.php';
require_once __DIR__ . '/../includes/config.inc.php';
require_once __DIR__ . '/../includes/db.inc.php';
$conn = dbConnect();

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Bad Request']);
    error_log('Fehlende ID');
    exit;
}

$id = intval($_GET['id']);
$stmt = $conn->prepare("SELECT cv_path FROM tbl_applicants WHERE id = ?");
$stmt->bind_param('i', $id);
$stmt->execute();
$stmt->bind_result($cvPath);
$stmt->fetch();
$stmt->close();
$conn->close();


if (!$cvPath || !file_exists(__DIR__ . "/../$cvPath")) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Not Found']);
    error_log('Datei nicht gefunden');
    exit;
}

$fullPath = __DIR__ . "/../$cvPath";
$basename = basename($fullPath);

header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header("Content-Disposition: attachment; filename=\"$basename\"");
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($fullPath));
readfile($fullPath);
exit;
?>