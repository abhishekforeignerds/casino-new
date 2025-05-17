<?php
session_start();

// Restrict access if the user is not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: sign-in.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Casino - Online Casino Platform</title>
    <link rel="icon" type="image/png" href="assets/images/favicon.png" sizes="16x16">
    <!-- bootstrap 5  -->
    <link rel="stylesheet" href="assets/css/lib/bootstrap.min.css">
    <!-- Icon Link  -->
    <link rel="stylesheet" href="assets/css/all.min.css"> 
    <link rel="stylesheet" href="assets/css/line-awesome.min.css"> 
    <link rel="stylesheet" href="assets/css/lib/animate.css"> 
    <script>
        let bankValue = <?php echo htmlspecialchars($_SESSION['bets']['bank_value']); ?>;
    </script>
	<link href="./assets-normal/css/style.css" rel="stylesheet" type="text/css">
    <style>
        body{
            margin:0px;
            padding:0px;
            box-sizing:border-box;
        }
        div#container {
    margin: 10rem 2rem;
    height: 100vh;
}
        #luck-thirty-six-time {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, #ff0000, #990000);
    color: white;
    font-size: 20px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

    </style>
    <!-- Plugin Link -->
    <link rel="stylesheet" href="assets/css/lib/slick.css">

    <!-- Main css -->
    <link rel="stylesheet" href="assets/css/main.css">
</head>
    <body data-bs-spy="scroll" data-bs-offset="170" data-bs-target=".privacy-policy-sidebar-menu">

        <div class="overlay"></div>
        <div class="preloader">
            <div class="scene" id="scene">
                <input type="checkbox" id="andicator" />
                <div class="cube">
                    <div class="cube__face cube__face--front"><i></i></div>
                    <div class="cube__face cube__face--back"><i></i><i></i></div>
                    <div class="cube__face cube__face--right">
                        <i></i> <i></i> <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--left">
                        <i></i> <i></i> <i></i> <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--top">
                        <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--bottom">
                        <i></i> <i></i> <i></i> <i></i>
                    </div>
                </div>
            </div>
        </div>

    <div class="header">
    <div class="container">
        <div class="header-bottom">
            <div class="header-bottom-area align-items-center">
                <div class="logo"><a href="poker-roulette.php"><img src="assets/images/logo.png" alt="logo"></a></div>
                <ul class="menu">
                    <li>
                        <a href="poker-roulette.php">Home</a>
                    </li>
                    <li>
                        <a href="about.php">About</a>
                    </li>
                    <li>
                        <a href="games.php">Games <span class="badge badge--sm badge--base text-dark">NEW</span></a>
                    </li>
                    
                    <li>
                        <a href="contact.php">Contact</a>
                    </li>
                    <li>
                        <a href="logout.php" class="cmn--btn active">Logout</a>
                 
                    </li>
                    <li>
                    <a class="text-center mt-3">Welcome, <?php echo htmlspecialchars($_SESSION['user_id']); ?>!</a>
                 
                    </li>
                    <button class="btn-close btn-close-white d-lg-none"></button>
                </ul>
                <div class="header-trigger-wrapper d-flex d-lg-none align-items-center">
                    <div class="header-trigger me-4">
                        <span></span>
                    </div>
                    <a href="sign-in.php" class="cmn--btn active btn--md d-none d-sm-block">Sign In</a>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="container">
        
	</div>
  
	<div id="roulette"></div>
	
	<script src="./assets-normal/js/app.js"></script>
   <!-- Footer Section Starts Here -->
   <footer class="footer-section bg_img" style="background: url(assets/images/footer/bg.jpg) center;">
    <div class="footer-top">
        <div class="container">
            <div class="footer-wrapper d-flex flex-wrap align-items-center justify-content-md-between justify-content-center">
                <div class="logo mb-3 mb-md-0"><a href="poker-roulette.php"><img src="assets/images/logo.png" alt="logo"></a></div>
                <ul class="footer-links d-flex flex-wrap justify-content-center">
                    <li><a href="games.php">Games</a></li>
                    <li><a href="terms-conditions.php">Terms & Conditions</a></li>
                    <li><a href="policy.php">Privacy Policy</a></li>
                </ul>
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <div class="container">
        <div class="footer-wrapper d-flex flex-wrap justify-content-center align-items-center text-center">
    <p class="copyright text-white">Copyrights &copy; <?php echo date("Y"); ?> All Rights Reserved by 
        <a href="#0" class=" text--base ms-2">Viserlab</a>
    </p>
</div>

        </div>
    </div>
    <div class="shapes">
        <img src="assets/images/footer/shape.png" alt="footer" class="shape1">
    </div>
</footer>
<!-- Footer Section Ends Here -->
    

<!-- jQuery library -->
<script src="assets/js/lib/jquery-3.6.0.min.js"></script>
<!-- bootstrap 5 js -->
<script src="assets/js/lib/bootstrap.min.js"></script>

<!-- Pluglin Link -->
<script src="assets/js/lib/slick.min.js"></script>

<!-- main js -->
<script src="assets/js/main.js"></script>  

</body>
</html>
