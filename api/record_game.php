<?php
// DEV mode: show & log everything
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Turn mysqli exceptions into catchable exceptions
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

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
$user_id     = $_SESSION['user_id'];
$game_id     = 1;
$winningSpin = $_POST['winningSpin'];
$betTotal    = $_POST['betTotal'];
$winValue    = $_POST['winValue'];
$withdrawTime  = $_POST['withdrawTime'] ?? null;
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
// **Always** coerce to int
$suiticonnum = (int) $_POST['suiticonnum'];

if (!is_numeric($winningSpin) || !is_numeric($betTotal) || !is_numeric($winValue)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
    exit;
}

if ($betTotal <= 0) {
    // Nothing to record, but still a success
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


        if ($auto_claim) {
            $claimpoint    = $win_value;
            $unclaimpoint  = 0;
            $auto_claim    = 1;
            $insertSql = "
                INSERT INTO claim_point_data
                    (user_id, claim_point, unclaim_point, balance, auto_claim, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ";
        } else {
            $claimpoint    = 0;
            $unclaimpoint  = $win_value;
            $auto_claim    = 0;
            $insertSql = "
                INSERT INTO claim_point_data
                    (user_id, claim_point, unclaim_point, balance, auto_claim, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ";
        }
        
        try {
            $stmt = $conn->prepare($insertSql);
            // types:    i         i           i            i         i           s           s
            $stmt->bind_param(
                'iiiiiss',
                $user_id,
                $claimpoint,
                $unclaimpoint,
                $betTotal,
                $auto_claim,
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
        

} else {
    $winning_number = null;
    $lose_number    = (int) $winningSpin;
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
        // this is the exact error (e.g. column can’t be null, syntax, etc.)
        'error'   => $e->getMessage()
    ]);
    exit;
}

// // 4) Optionally update user points
// if ($win_value > 0) {
//     try {
//         $ustmt = $conn->prepare('UPDATE `user` SET points = points + ? WHERE id = ?');
//         $ustmt->bind_param('di', $win_value, $user_id);
//         $ustmt->execute();
//         $ustmt->close();
//     } catch (mysqli_sql_exception $e) {
//         // log but don’t break the user’s flow
//         error_log('Points update failed: ' . $e->getMessage());
//     }
// }

// 5) Return success
echo json_encode(['success' => true, 'message' => 'Game result recorded successfully']);
