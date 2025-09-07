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
require_once __DIR__ . '/../includes/recaptcha.inc.php';
header('Content-Type: application/json');
require __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$db = dbConnect();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $recaptchaToken = $_POST['recaptcha'] ?? null;
    if (!$recaptchaToken || !verify_recaptcha($recaptchaToken, $_SERVER['REMOTE_ADDR'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errorType' => 'recaptchaFailed'
        ]);
        exit;
    }

    $required = ['first_name', 'last_name', 'email', 'phone', 'message', 'job_id'];
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'errorType' => 'emptyFields'
            ]);
            exit;
        }
    }

    if (!isset($_FILES['cv']) || $_FILES['cv']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errorType' => 'failedUpload'
        ]);
        exit;
    }

    $firstName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($_POST['first_name']));
    $lastName = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($_POST['last_name']));
    $dateStr = date('Y-m-d');
    $folderName = "{$lastName}_{$firstName}_{$dateStr}";
    $uploadDir = dirname(__DIR__) . "/uploads/$folderName";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $originalFilename = basename($_FILES['cv']['name']);
    $targetPath = $uploadDir . '/' . $originalFilename;

    if (!move_uploaded_file($_FILES['cv']['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Datei konnte nicht gespeichert werden');
        exit;
    }

    $filename = basename($_FILES['cv']['name']);
    $cvPathForDb = "uploads/$folderName/$filename";

    $stmt = $db->prepare("
        INSERT INTO tbl_applicants 
          (job_id, first_name, last_name, email, phone, message, cv_path, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    $stmt->bind_param(
        'sssssss',
        $_POST['job_id'],
        $_POST['first_name'],
        $_POST['last_name'],
        $_POST['email'],
        $_POST['phone'],
        $_POST['message'],
        $cvPathForDb
    );

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('Statement-Ausführung fehlgeschlagen');
        exit;
    }

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = MAIL['host'];
        $mail->SMTPAuth = true;
        $mail->Username = MAIL['user'];
        $mail->Password = MAIL['pwd'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = MAIL['port'];
        $mail->CharSet = 'UTF-8';
        $mail->setFrom(MAIL['from_email'], 'Job Portal Bewerbung');
        $mail->addAddress($_POST['email'], $_POST['first_name'] . ' ' . $_POST['last_name']);
        $mail->isHTML(true);
        $mail->Subject = 'Bewerbung erfolgreich eingegangen';
        $mail->Body = "
            <p>Guten Tag,</p>
            <p>vielen Dank für Ihre Bewerbung auf unserem Job Portal!</p>
            <p>Wir werden Ihre Unterlagen prüfen und uns innerhalb von wenigen Tagen bei Ihnen melden.</p>
            <p>Beste Grüße,<br><br>Ihr JobPortal-Team</p>
        ";

        $mail->send();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('[MAIL ERROR] ' . $mail->ErrorInfo . PHP_EOL, 3, __DIR__ . '/../logs/mail_error.log');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Bewerbung erfolgreich übermittelt'
    ]);
}
?>