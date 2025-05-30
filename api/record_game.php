<?php
// DEV mode: show & log everything
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Turn mysqli exceptions into catchable exceptions
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
date_default_timezone_set('Asia/Kolkata');
header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/../db.php';

// 1) Auth & param checks
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

if (!isset($_POST['winningSpin'], $_POST['betTotal'], $_POST['winValue'], $_POST['suiticonnum'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Required parameters missing']);
    exit;
}

// 2) Cast & validate
$user_id      = $_SESSION['user_id'];
$game_id      = 1;
$winningSpin  = $_POST['winningSpin'];
$betTotal     = $_POST['betTotal'];
$winValue     = $_POST['winValue'];
$withdrawTime = $_POST['withdrawTime'] ?? null;

if (!$withdrawTime) {
    http_response_code(422);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'Validation',
        'message' => 'withdrawTime is required.'
    ]);
    exit;
}

// Combine with today’s date
$currentDate   = date('Y-m-d');
$fullTimestamp = date('Y-m-d H:i:s', strtotime("$currentDate $withdrawTime"));
$suiticonnum   = (int) $_POST['suiticonnum'];

if (!is_numeric($winningSpin) || !is_numeric($betTotal) || !is_numeric($winValue)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
    exit;
}

if ($betTotal <= 0) {
    echo json_encode(['success' => true, 'message' => 'No bet to record']);
    exit;
}

// 3) Build insert values
$win_value = (float) $winValue;

if ($winValue > 0) {
    $winning_number = (int) $winningSpin;
    $lose_number    = null;

    $userquery = "SELECT auto_claim FROM user WHERE id = ?";
    $stmt = $conn->prepare($userquery);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    $auto_claim = $row['auto_claim'];

    $dt = new DateTime($fullTimestamp);
    $dt->sub(new DateInterval('PT2M')); // “PT2M” = 2 minutes before
    $twoMinBefore = $dt->format('Y-m-d H:i:s');

    $userquery = "
        SELECT *
        FROM total_bet_history
        WHERE user_id = ? AND withdraw_time = ?
    ";
    $stmt = $conn->prepare($userquery);
    $stmt->bind_param("is", $user_id, $twoMinBefore);
    $stmt->execute();
    $result = $stmt->get_result();

    $totalhistory = [];
    while ($row = $result->fetch_assoc()) {
        $totalhistory[] = $row;
    }
    $stmt->close();

    foreach ($totalhistory as $betTotal) {
        $serial_number = $betTotal['ticket_serial'];
        $json = $betTotal['card_bet_amounts'];
        $cardBets = json_decode($json, true);

        $claimpoint = 0;
        $unclaimpoint = 0;

        foreach ($cardBets as $cardIndex => $betAmount) {
            if ((int)$cardIndex === (int)$winning_number) {
                if ($auto_claim) {
                    $claimpoint = floatval($betAmount) * 10;
                } else {
                    $unclaimpoint = floatval($betAmount) * 10;
                }
                break;
            } else {
                $claimpoint = 0;
                $unclaimpoint = 0;
            }
        }

        $insertSql = "
            INSERT INTO claim_point_data
                (user_id, claim_point, unclaim_point, balance, auto_claim, ticket_serial, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ";

        try {
            $stmt = $conn->prepare($insertSql);
            $stmt->bind_param(
                'iiiiiiss',
                $user_id,
                $claimpoint,
                $unclaimpoint,
                $betTotal['bet_amount'],
                $auto_claim,
                $serial_number,
                $fullTimestamp,
                $fullTimestamp
            );
            $stmt->execute();
            $stmt->close();
        } catch (mysqli_sql_exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database error on INSERT',
                'error'   => $e->getMessage()
            ]);
            exit;
        }
    }

} else {
    $winning_number = null;
    $lose_number    = (int) $winningSpin;

    // Fetch auto_claim
    $userquery = "SELECT auto_claim FROM user WHERE id = ?";
    $stmt = $conn->prepare($userquery);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    $auto_claim = $row['auto_claim'];

    $dt = new DateTime($fullTimestamp);
    $dt->sub(new DateInterval('PT2M')); // 2 minutes before
    $twoMinBefore = $dt->format('Y-m-d H:i:s');

    // Get bet history
    $userquery = "
        SELECT *
        FROM total_bet_history
        WHERE user_id = ? AND withdraw_time = ?
    ";
    $stmt = $conn->prepare($userquery);
    $stmt->bind_param("is", $user_id, $twoMinBefore);
    $stmt->execute();
    $result = $stmt->get_result();

    $totalhistory = [];
    while ($row = $result->fetch_assoc()) {
        $totalhistory[] = $row;
    }
    $stmt->close();

    // Insert 0 claim/unclaim point
    foreach ($totalhistory as $betTotal) {
        $serial_number = $betTotal['ticket_serial'];

        $insertSql = "
            INSERT INTO claim_point_data
                (user_id, claim_point, unclaim_point, balance, auto_claim, ticket_serial, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ";

        try {
            $stmt = $conn->prepare($insertSql);
            $zero = 0;
            $stmt->bind_param(
                'iiiiiiss',
                $user_id,
                $zero, // claim_point
                $zero, // unclaim_point
                $betTotal['bet_amount'],
                $auto_claim,
                $serial_number,
                $fullTimestamp,
                $fullTimestamp
            );
            $stmt->execute();
            $stmt->close();
        } catch (mysqli_sql_exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database error on INSERT in else',
                'error'   => $e->getMessage()
            ]);
            exit;
        }
    }
}


$ts = date('Y-m-d H:i:s');

$insertSql = "
    INSERT INTO game_results
        (user_id, game_id, winning_number, lose_number, suiticonnum, bet, win_value, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
";

try {
    $stmt = $conn->prepare($insertSql);
    $stmt->bind_param(
        'iiiiiddss',
        $user_id,
        $game_id,
        $winning_number,
        $lose_number,
        $suiticonnum,
        $betTotal,
        $win_value,
        $fullTimestamp,
        $fullTimestamp
    );
    $stmt->execute();
    $stmt->close();
} catch (mysqli_sql_exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error on INSERT',
        'error'   => $e->getMessage()
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Game result recorded successfully',
    'post_data' => $_POST
]);
