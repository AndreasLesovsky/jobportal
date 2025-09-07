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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];

    $recaptchaToken = $data['recaptcha'] ?? $data['recaptchaResponse'] ?? null;
    if (!$recaptchaToken || !verify_recaptcha($recaptchaToken, $_SERVER['REMOTE_ADDR'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errorType' => 'recaptchaFailed'
        ]);
        exit;
    }

    $name = htmlspecialchars($data['name'] ?? '');
    $email = htmlspecialchars($data['email'] ?? '');
    $message = htmlspecialchars($data['message'] ?? '');

    if (!$name || !$email || !$message) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errorType' => 'emptyFields'
        ]);
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
        $mail->setFrom(MAIL['from_email'], MAIL['from_name']);
        $mail->addAddress(MAIL['to_email'], MAIL['to_name']);
        $mail->isHTML(true);
        $mail->Subject = 'Demo Anfrage für Job Portal';
        $mail->Body = "<p><strong>Name:</strong> $name</p>
                         <p><strong>E-Mail:</strong> $email</p>
                         <p><strong>Nachricht:</strong><br>$message</p>";
        $mail->AltBody = "Name: $name\nE-Mail: $email\nNachricht:\n$message";

        if ($mail->send()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
            error_log('Mailversand fehlgeschlagen');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Internal Server Error']);
        error_log('[MAIL ERROR] ' . $mail->ErrorInfo . PHP_EOL, 3, __DIR__ . '/../logs/mail_error.log');
    }
}
?>