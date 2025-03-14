<?php
session_start();
header('Content-Type: application/json');

$response = [
    'bankValue' => $_SESSION['bets']['bank_value'] ?? 1000, // Default value if not set
    'currentBet' => $_SESSION['bets']['current_bet'] ?? 0,
    'wager' => $_SESSION['bets']['wager'] ?? 5,
    'lastWager' => $_SESSION['bets']['lastWager'] ?? 0,
    'bet' => $_SESSION['bets']['bet'] ?? [],
    'numbersBet' => $_SESSION['bets']['numbersBet'] ?? [],
    'previousNumbers' => $_SESSION['bets']['previousNumbers'] ?? [],
];

echo json_encode($response);
?>
