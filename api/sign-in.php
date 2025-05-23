<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require '../db.php';
// …rest of your code…

$response = ['status' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $login = trim($_POST['login']);
    $password = trim($_POST['password']);
    
    $stmt = $conn->prepare("SELECT id, username, first_name, last_name, points, email, password, status FROM user WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $login, $login);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if ($user['status'] == 'inactive') {
            $response['message'] = "Account is not active";
        } elseif (password_verify($password, $user['password'])) {
            $stmt = $conn->prepare("SELECT SUM(win_value) AS total_win FROM game_results WHERE user_id = ?");
            $stmt->bind_param("i", $user['id']);
            $stmt->execute();
            $stmt->bind_result($winningPoints);
            $stmt->fetch();
            $stmt->close();

            $response['status'] = true;
            $response['message'] = "Login successful";
            $response['data'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'points' => $user['points'],
                'winning_points' => $winningPoints ?? 0
            ];
        } else {
            $response['message'] = "Invalid password";
        }
    } else {
        $response['message'] = "User not found";
    }


} else {
    $response['message'] = "Invalid request";
}

echo json_encode($response);
