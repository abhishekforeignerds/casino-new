<?php
session_start();
require_once __DIR__ . '/../db.php';  // brings in $conn
date_default_timezone_set('Asia/Kolkata');
header('Content-Type: application/json; charset=utf-8');

// ————————————————————————————————————————————————————————————————————————————————
// Convert PHP errors/exceptions into JSON
ini_set('display_errors', '0');
error_reporting(E_ALL);
set_error_handler(function($sev, $msg, $file, $line) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'PHP Error',
        'message' => "$msg in $file on line $line"
    ]);
    exit;
});
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'Exception',
        'message' => $e->getMessage()
    ]);
    exit;
});
// ————————————————————————————————————————————————————————————————————————————————

// 1) Determine insertion source
$insFrom = (php_sapi_name() === 'cli') ? 'server' : 'web';

// 2) Get current IST time as "hh:mm AM/PM"
$now          = new DateTime();
$withdrawTime = $now->format('h:i A');

// 3) Pick a random card/suit
$options = [
    ["src"=>"/assets-normal/img/golden-j.png","suiticon"=>"♦"],
    ["src"=>"/assets-normal/img/golden-j.png","suiticon"=>"♥"],
    ["src"=>"/assets-normal/img/golden-q.png","suiticon"=>"♠"],
    ["src"=>"/assets-normal/img/goldens-k.png","suiticon"=>"♣"],
];
$pick = $options[array_rand($options)];

// 4) Fetch the first game_history row
$res   = $conn->query("SELECT id, history FROM game_history ORDER BY id ASC LIMIT 1");
$game  = $res ? $res->fetch_assoc() : null;
if (!$game) {
    echo json_encode([
        "success" => false,
        "message" => "No game_history row found to update"
    ]);
    exit;
}
$gameId      = $game['id'];
$historyJson = $game['history'];

// 5) Decode existing JSON (or start fresh)
$historyArr = json_decode($historyJson, true);
if (!is_array($historyArr)) {
    $historyArr = [];
}

// 6) Build new entry (once)
$newEntry = [
    "src"          => $pick['src'],
    "suiticon"     => $pick['suiticon'],
    "wintimes"     => "N",
    "withdrawTime" => $withdrawTime,
    "ins_from"     => $insFrom
];

// 7) Duplicate‐check by withdrawTime
foreach ($historyArr as $entry) {
    if (!empty($entry['withdrawTime']) && $entry['withdrawTime'] === $withdrawTime) {
        echo json_encode([
            "success" => false,
            "message" => "Entry for {$withdrawTime} already exists"
        ]);
        exit;
    }
}

// 8) Append & update
$historyArr[] = $newEntry;
$updatedJson  = json_encode($historyArr, JSON_UNESCAPED_UNICODE);

$upd = $conn->prepare("
    UPDATE game_history
       SET history = ?
     WHERE id = ?
");
$upd->bind_param('si', $updatedJson, $gameId);
$upd->execute();

if ($upd->affected_rows > 0) {
    echo json_encode([
        "success"  => true,
        "message"  => "Appended new entry",
        "newEntry" => $newEntry
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Failed to update history"
    ]);
}
exit;
