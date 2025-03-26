<?php
session_start();
require 'db.php';

// If already logged in, redirect to dashboard (or any page you choose)
if (isset($_SESSION['user_id'])) {
    header("Location: poker-roulette.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Retrieve the input values; the "login" field can be email or username
    $login = trim($_POST['login']);
    $password = trim($_POST['password']);
    
    // Prepare the query to fetch user record matching either username or email
    $stmt = $conn->prepare("SELECT id, username,first_name, points, email, password FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $login, $login);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        // Verify the password against the hashed password in the database
        if (password_verify($password, $user['password'])) {
            // Valid credentials – set session variables and redirect
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['fname'] = $user['first_name'];
            $_SESSION['points'] = $user['points'];
            header("Location: poker-roulette.php");
            exit();
        } else {
            $error = "Invalid username/email or password.";
        }
    } else {
        $error = "Invalid username/email or password.";
    }
    $stmt->close();
}
?>
   <!-- meta tags and other links -->
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
                <div class="logo"><a href="index.php"><img src="assets/images/logo.png" alt="logo"></a></div>
                <ul class="menu">
                    <li>
                        <a href="index.php">Home</a>
                    </li>
                    <li>
                        <a href="about.php">About</a>
                    </li>
                    <li>
                        <a href="games.php">Games <span class="badge badge--sm badge--base text-dark">NEW</span></a>
                    </li>
                    <li>
                        <a href="faq.php">Faq</a>
                    </li>
                    <li>
                        <a href="#0">Pages</a>
                        <ul class="sub-menu">
                            <li>
                                <a href="dashboard.php">User Dashboard</a>
                            </li>
                            <li>
                                <a href="game-details.php">Game Details</a>
                            </li>
                            <li>
                                <a href="policy.php">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="terms-conditions.php">Terms & Conditions</a>
                            </li>
                            <li>
                                <a href="sign-in.php">Sign In</a>
                            </li>
                            <li>
                                <a href="sign-up.php">Sign Up</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#0">Blog</a>
                        <ul class="sub-menu">
                            <li><a href="blog.php">Blog</a></li>
                            <li><a href="blog-details.php">Blog Details</a></li>
                        </ul>
                    </li>
                    <li>
                        <a href="contact.php">Contact</a>
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
    <!-- inner hero section start -->
<section class="inner-banner bg_img" style="background: url('assets/images/inner-banner/bg2.jpg') top;">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-7 col-xl-6 text-center">
        <h2 class="title text-white">Sign In</h2>
        <ul class="breadcrumbs d-flex flex-wrap align-items-center justify-content-center">
          <li><a href="index.php">Home</a></li>
          <li>Sign In</li>
        </ul>
      </div>
    </div>
  </div>
</section>
<!-- inner hero section end -->


    <!-- Account Section Starts Here -->
    <section class="account-section overflow-hidden bg_img" style="background:url(assets/images/account/bg.jpg)">
        <div class="container">
            <div class="account__main__wrapper">
                <div class="account__form__wrapper">
                    <div class="logo"><a href="index.php"><img src="assets/images/logo.png" alt="logo"></a></div>
                    <form class="account__form form row g-4" action="sign-in.php" method="POST">
        <?php if(isset($error)) { echo '<p style="color:red;">' . $error . '</p>'; } ?>
        <div class="col-12">
            <div class="form-group">
                <div class="input-pre-icon"><i class="las la-user"></i></div>
                <input id="username" type="text" name="login" class="form--control form-control style--two" placeholder="Email or Username" required>
            </div>
        </div>
        <div class="col-12">
            <div class="form-group">
                <div class="input-pre-icon"><i class="las la-lock"></i></div>
                <input id="pass" type="password" name="password" class="form--control form-control style--two" placeholder="Password" required>
            </div>
        </div>
        <div class="col-12">
            <div class="form-group">
                <button class="cmn--btn active w-100 btn--round" type="submit">Sign In</button>
            </div>
        </div>
        <div class="d-flex flex-wrap flex-sm-nowrap justify-content-between mt-5">
            <div class="form--check d-flex align-items-center">
                <input id="check1" type="checkbox" name="remember" checked>
                <label for="check1">Remember me</label>
            </div>
            <a href="#0" class="forgot-pass d-block text--base">Forgot Password ?</a>
        </div>
    </form>

    <!-- Optional: Logout button (shown when a user is logged in) -->
    <?php
    if(isset($_SESSION['user_id'])) {
        echo '<a href="logout.php" class="cmn--btn active w-100 btn--round" style="margin-top:20px;">Logout</a>';
    }
    ?>
                </div>
                <div class="account__content__wrapper" >
                    <div class="content text-center text-white">
                        <h3 class="title text--base mb-4">Welcome to Casinio</h3>
                        <p class="">Sign in your Account. Atque, fuga sapiente, doloribus qui enim tempora?</p>
                        <p class="account-switch mt-4">Don't have an Account yet ? <a class="text--base ms-2" href="sign-up.php">Sign Up</a></p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Account Section Ends Here -->


    <!-- Footer Section Starts Here -->
<footer class="footer-section bg_img" style="background: url(assets/images/footer/bg.jpg) center;">
    <div class="footer-top">
        <div class="container">
            <div class="footer-wrapper d-flex flex-wrap align-items-center justify-content-md-between justify-content-center">
                <div class="logo mb-3 mb-md-0"><a href="index.php"><img src="assets/images/logo.png" alt="logo"></a></div>
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
                <p class="copyright text-white">Copyrights &copy; 2021 All Rights Reserved by <a href="#0" class=" text--base ms-2">Viserlab</a></p>
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