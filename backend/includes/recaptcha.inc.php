<?php
function verify_recaptcha(string $token, string $ip): bool {
    $secret = RECAPTCHA_SECRET;

    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $params = http_build_query([
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $ip
    ]);

    $response = file_get_contents("$url?$params");

    if (!$response) {
        return false;
    }

    $result = json_decode($response);
    return isset($result->success) && $result->success === true;
}
?>