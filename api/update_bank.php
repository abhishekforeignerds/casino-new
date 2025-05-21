<?php
session_start();
include '../db.php'; // Ensure this file sets up your database connection (e.g., $conn)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}
date_default_timezone_set('Asia/Kolkata');
$user_id = $_SESSION['user_id'];

// Check if a bank value was posted
if (!isset($_POST['bankValue'])) {
    echo json_encode(["success" => false, "message" => "No bank value provided."]);
    exit;
}

$bankValue = $_POST['bankValue'];

// Validate that bankValue is numeric (adjust validation as needed)
if (!is_numeric($bankValue)) {
    echo json_encode(["success" => false, "message" => "Invalid bank value."]);
    exit;
}

// Update the user's points in the database using a prepared statement
$query = "UPDATE user SET points = ? WHERE id = ?";
if ($stmt = mysqli_prepare($conn, $query)) {
    mysqli_stmt_bind_param($stmt, "di", $bankValue, $user_id);
    if (mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);

        // Retrieve the updated user record from the database
        $query2 = "SELECT id, username, first_name, points FROM user WHERE id = ?";
        if ($stmt2 = mysqli_prepare($conn, $query2)) {
            mysqli_stmt_bind_param($stmt2, "i", $user_id);
            mysqli_stmt_execute($stmt2);
            mysqli_stmt_bind_result($stmt2, $id, $username, $first_name, $points);
            if (mysqli_stmt_fetch($stmt2)) {
                mysqli_stmt_close($stmt2);

                // Destroy the current session and start a new one with the updated user data
                // session_destroy();
                // session_start();
                // $_SESSION['user_id'] = $id;
                // $_SESSION['username'] = $username;
                // $_SESSION['fname'] = $first_name;
                // $_SESSION['points'] = $points;

                echo json_encode(["success" => true, "message" => "Bank value updated and session refreshed successfully."]);
                exit;
            } else {
                mysqli_stmt_close($stmt2);
                echo json_encode(["success" => false, "message" => "Failed to fetch updated user data."]);
                exit;
            }
        } else {
            echo json_encode(["success" => false, "message" => "Database error fetching updated user data."]);
            exit;
        }
    } else {
        mysqli_stmt_close($stmt);
        echo json_encode(["success" => false, "message" => "Failed to update bank value."]);
        exit;
    }
} else {
    echo json_encode(["success" => false, "message" => "Database error."]);
    exit;
}
?>
