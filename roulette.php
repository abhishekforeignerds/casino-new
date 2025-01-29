<?php
session_start();

// Restrict access if the user is not logged in
if (!isset($_SESSION['user'])) {
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>

<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
	<title>Javascript Roulette</title>
	<meta name="title" content="Javascript Roulette">
	<meta name="description" content="A fully functioning roulette game made using Javascript and CSS">
	<meta name="author" content="ozboware">
	<meta property="og:url" content="/">
	<meta property="og:title" content="Javascript Roulette">
	<meta property="og:description" content="A fully functioning roulette game made using Javascript and CSS">
	<link href="./assets/css/style.css" rel="stylesheet" type="text/css">
    <style>
        body{
            margin:0px;
            padding:0px;
            box-sizing:border-box;
        }
    </style>
</head>

<body>
<div class="container">
        <h2 class="text-center mt-3">Welcome, <?php echo htmlspecialchars($_SESSION['user']['username']); ?>!</h2>
        <a href="logout.php" class="btn btn-danger mt-3">Logout</a>
	</div>
	<div id="roulette"></div>
	<script src="./assets/js/app.js"></script>
</body>
