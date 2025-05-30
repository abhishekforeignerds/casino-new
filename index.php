<?php
session_start();

// Restrict access if the user is not logged in
// if (!isset($_SESSION['user_id'])) {
//     header("Location: sign-in.php");
//     exit();
// }
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
                <div class="logo"><a href="poker-roulette.php"><img src="assets/images/logo.png" alt="logo"></a></div>
                <ul class="menu">
                    <li>
                        <a href="/">Home</a>
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
                    <a class="text-center mt-3">Welcome, <?php 
if (isset($_SESSION['fname'])) {
    echo htmlspecialchars($_SESSION['fname']);
} else {
    echo "Guest"; // You can set a default value if the session variable is not set
}
?>
!</a>
                 
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

    <!-- Banner Section Starts Here -->
    <section class="banner-section bg_img overflow-hidden" style="background:url(assets/images/banner/bg.png) center">
        <div class="container">
            <div class="banner-wrapper d-flex flex-wrap align-items-center">
                <div class="banner-content">
                    <h1 class="banner-content__title">Play <span class="text--base">Online Casino</span> & Win Money Unlimited</h1>
                    <p class="banner-content__subtitle">PLAY CASINO AND EARN CRYPTO IN ONLINE. THE ULTIMATE ONLINE CASINO PLATFORM.</p>
                    <div class="button-wrapper">
                        <a href="#top-games" class="cmn--btn active btn--lg"><i class="las la-play"></i> Play Now</a>
                       <?php if (!isset($_SESSION['user_id'])) { ?>
                        <a href="sign-up.php" class="cmn--btn btn--lg">Sign Up</a>
                        <?php } ?>
                    </div>
                    <img src="assets/images/banner/card.png" alt="" class="shape1">
                </div>
                <div class="banner-thumb">
                    <img src="assets/images/banner/thumb.png" alt="banner">
                </div>
            </div>
        </div>
    </section>
    <!-- Banner Section Ends Here -->


    <!-- About Section Starts Here -->
    <section class="about-section padding-top padding-bottom overflow-hidden">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <div class="about-content">
                        <div class="section-header">
                            <h2 class="section-header__title">About The Casino</h2>
                            <p>A casino is a facility for certain types of gambling. Casinos are often built near or combined with hotels, resorts, restaurants, retail shopping, cruise ships, and other tourist attractions. Some casinos are also known for hosting live entertainment, such as stand-up comedy, concerts, and sports.</p>
                        </div>
                        <a href="about.php" class="cmn--btn active">Know More</a>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="aobut-thumb section-thumb">
                        <img src="assets/images/about/thumb.png" alt="about" class="ms-lg-5">
                    </div>
                </div>
            </div>
        </div>
        <div class="shapes">
            <img src="assets/images/about/shape.png" alt="about" class="shape shape1">
        </div>
    </section>
    <!-- About Section Ends Here -->


    <!-- Game Section Starts Here -->
    <section id="top-games" class="game-section padding-top padding-bottom bg_img" style="background: url(assets/images/game/bg3.jpg);">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-6 col-xl-5">
                    <div class="section-header text-center">
                        <h2 class="section-header__title">Top Awesome Games</h2>
                        <p>A casino is a facility for certain types of gambling. Casinos are often built combined with hotels, resorts,.</p>
                    </div>
                </div>
            </div>
            <div class="row gy-4 justify-content-center">
                <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                    <div class="game-item">
                        <div class="game-inner">
                            <div class="game-item__thumb">
                                <img src="assets/images/game/item2.png" alt="game">
                            </div>
                            <div class="game-item__content">
                                <h4 class="title">Roulette</h4>
                                <p class="invest-info">Lucky Thirty Six Mini Timer</p>
                                <p class="invest-amount">₹10.49 - ₹1,000</p>
                             <?php
                                if (!isset($_SESSION['user_id'])) { ?>
   <a href="/sign-in.php" class="cmn--btn active btn--md radius-0">Play Now</a>
                                <?php } else { ?>
                                    <a href="/luck-thirty-six-mini-timer.php" class="cmn--btn active btn--md radius-0">Play Now</a>
<?php }
?>
                               
                            </div>
                        </div>
                        <div class="ball"></div>
                    </div>
                </div>
                <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                    <div class="game-item">
                        <div class="game-inner">
                            <div class="game-item__thumb">
                                <img src="assets/images/game/item1.png" alt="game">
                            </div>
                            <div class="game-item__content">
                                <h4 class="title">Zero To Ninty</h4>
                                <p class="invest-info">Invest Limit</p>
                                <p class="invest-amount">₹10.49 - ₹1,000</p>
                                <a href="#0" class="cmn--btn active btn--md radius-0">Play Now</a>
                            </div>
                        </div>
                        <div class="ball"></div>
                    </div>
                </div>
                <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                    <div class="game-item">
                        <div class="game-inner">
                            <div class="game-item__thumb">
                                <img src="assets/images/game/item3.png" alt="game">
                            </div>
                            <div class="game-item__content">
                                <h4 class="title">Number Buy</h4>
                                <p class="invest-info">Invest Limit</p>
                                <p class="invest-amount">₹10.49 - ₹1,000</p>
                                <a href="#0" class="cmn--btn active btn--md radius-0">Play Now</a>
                            </div>
                        </div>
                        <div class="ball"></div>
                    </div>
                </div>
                <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                    <div class="game-item">
                        <div class="game-inner">
                            <div class="game-item__thumb">
                                <img src="assets/images/game/item4.png" alt="game">
                            </div>
                            <div class="game-item__content">
                                <h4 class="title">Roulette</h4>
                                <p class="invest-info">Lucky Thirty Six Timer</p>
                                <p class="invest-amount">₹10.49 - ₹1,000</p>
                                <?php
                                if (!isset($_SESSION['user_id'])) { ?>
   <a href="/sign-in.php" class="cmn--btn active btn--md radius-0">Play Now</a>
                                <?php } else { ?>
                                    <a href="/luck-thirty-six-timer.php" class="cmn--btn active btn--md radius-0">Play Now</a>
<?php }
?>
                               
                            </div>
                        </div>
                        <div class="ball"></div>
                    </div>
                </div>
                <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                    <div class="game-item">
                        <div class="game-inner">
                            <div class="game-item__thumb">
                                <img src="assets/images/game/item5.png" alt="game">
                            </div>
                            <div class="game-item__content">
                                <h4 class="title">Card Game</h4>
                                <p class="invest-info">Invest Limit</p>
                                <p class="invest-amount">₹10.49 - ₹1,000</p>
                                <a href="#0" class="cmn--btn active btn--md radius-0">Play Now</a>
                            </div>
                        </div>
                        <div class="ball"></div>
                    </div>
                </div>
                <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                    <div class="game-item">
                        <div class="game-inner">
                            <div class="game-item__thumb">
                                <img src="assets/images/game/item6.png" alt="game">
                            </div>
                            <div class="game-item__content">
                                <h4 class="title">Dice Rolling</h4>
                                <p class="invest-info">Lucky Thirty Six</p>
                                <p class="invest-amount">₹10.49 - ₹1,000</p>
                                <?php
                                if (!isset($_SESSION['user_id'])) { ?>
   <a href="/sign-in.php" class="cmn--btn active btn--md radius-0">Play Now</a>
                                <?php } else { ?>
                                    <a href="/luck-thirty-six.php" class="cmn--btn active btn--md radius-0">Play Now</a>
<?php }
?>

                            </div>
                        </div>
                        <div class="ball"></div>
                    </div>
                </div>
                <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                    <div class="game-item">
                        <div class="game-inner">
                            <div class="game-item__thumb">
                                <img src="assets/images/game/item2.png" alt="game">
                            </div>
                            <div class="game-item__content">
                                <h4 class="title">Card Game</h4>
                                <p class="invest-info">Invest Limit</p>
                                <p class="invest-amount">₹10.49 - ₹1,000</p>
                                <a href="#0" class="cmn--btn active btn--md radius-0">Play Now</a>
                            </div>
                        </div>
                        <div class="ball"></div>
                    </div>
                </div>
                <div class="col-lg-4 col-xl-3 col-md-6 col-sm-6">
                    <div class="game-item">
                        <div class="game-inner">
                            <div class="game-item__thumb">
                                <img src="assets/images/game/item6.png" alt="game">
                            </div>
                            <div class="game-item__content">
                                <h4 class="title">Dice Rolling</h4>
                                <p class="invest-info">Invest Limit</p>
                                <p class="invest-amount">₹10.49 - ₹1,000</p>
                                <a href="#0" class="cmn--btn active btn--md radius-0">Play Now</a>
                            </div>
                        </div>
                        <div class="ball"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Game Section Ends Here -->


    <!-- Why Choose Us Section Starts Here -->
    <section class="why-section padding-top padding-bottom overflow-hidden">
        <div class="container">
            <div class="row justify-content-between gy-5">
                <div class="col-lg-5 col-xl-4">
                    <div class="section-header mb-4">
                        <h2 class="section-header__title">Why Play Our Casino</h2>
                        <p>A casino is a facility for certain types of gambling. Casinos are often built combined with hotels, resorts,</p>
                    </div>
                    <p>Debitis ad dolor sint consequatur hic, facere est doloribustemp oribus in laborum similique saepe bland itiis odio nulla repellat dicta reprehenderit. Obcaecati, sed perferendis? Quam cum debitis odit recusandae dolor earum.</p>
                </div>
                <div class="col-lg-7 col-xl-7">
                    <div class="row gy-4 gy-md-5 gy-lg-4 gy-xl-5">
                        <div class="col-lg-6 col-sm-6">
                            <div class="why-item">
                                <div class="why-item__thumb">
                                    <i class="las la-shield-alt"></i>
                                </div>
                                <div class="why-item__content">
                                    <h4 class="title">Secure Casino Games</h4>
                                    <p>Games available in most casinos are commonly called casino games. In a casino game. you will found options.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6 col-sm-6">
                            <div class="why-item">
                                <div class="why-item__thumb">
                                    <i class="las la-dice-six"></i>
                                </div>
                                <div class="why-item__content">
                                    <h4 class="title">Awesome Game State</h4>
                                    <p>Games available in most casinos are commonly called casino games. In a casino game. you will found options.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6 col-sm-6">
                            <div class="why-item">
                                <div class="why-item__thumb">
                                    <i class="las la-trophy"></i>
                                </div>
                                <div class="why-item__content">
                                    <h4 class="title">Higher Wining Chance</h4>
                                    <p>Games available in most casinos are commonly called casino games. In a casino game. you will found options.</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6 col-sm-6">
                            <div class="why-item">
                                <div class="why-item__thumb">
                                    <i class="las la-coins"></i>
                                </div>
                                <div class="why-item__content">
                                    <h4 class="title">Invest Win And Earn</h4>
                                    <p>Games available in most casinos are commonly called casino games. In a casino game. you will found options.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="shapes">
            <img src="assets/images/why/shape.png" alt="why" class="shape shape1">
        </div>
    </section>
    <!-- Why Choose Us Section Ends Here -->


    <!-- How Section Starts Here -->
    <section class="how-section padding-top padding-bottom bg_img" style="background: url(assets/images/how/bg2.jpg);">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-6">
                    <div class="section-header text-center">
                        <h2 class="section-header__title">How to Play Game</h2>
                        <p>A casino is a facility for certain types of gambling. Casinos are often built combined with hotels, resorts.</p>
                    </div>
                </div>
            </div>
            <div class="row gy-4 justify-content-center">
                <div class="col-sm-6 col-md-4 col-lg-4">
                    <div class="how-item">
                        <div class="how-item__thumb">
                            <i class="las la-user-plus"></i>
                            <div class="badge badge--lg badge--round radius-50">01</div>
                        </div>
                        <div class="how-item__content">
                            <h4 class="title">Sign Up First & Login</h4>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-4 col-lg-4">
                    <div class="how-item">
                        <div class="how-item__thumb">
                            <i class="las la-id-card"></i>
                            <div class="badge badge--lg badge--round radius-50">02</div>
                        </div>
                        <div class="how-item__content">
                            <h4 class="title">Complete you Profile</h4>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-4 col-lg-4">
                    <div class="how-item">
                        <div class="how-item__thumb">
                            <i class="las la-dice"></i>
                            <div class="badge badge--lg badge--round radius-50">03</div>
                        </div>
                        <div class="how-item__content">
                            <h4 class="title">Choose a Game & Play</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- How Section Ends Here -->


    <!-- Faq Section Starts Here -->
    <section class="faq-section padding-top padding-bottom overflow-hidden">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-7 col-xl-6">
                    <div class="section-header text-center">
                        <h2 class="section-header__title">Frequently Asked Questions</h2>
                        <p>A casino is a facility for certain types of gambling. Casinos are often built combined with hotels, resorts.</p>
                    </div>
                </div>
            </div>
            <div class="faq-wrapper row justify-content-between">
                <div class="col-lg-6">
                    <div class="faq-item">
                        <div class="faq-item__title">
                            <h5 class="title">01. How do I create Casine Account ?</h5>
                        </div>
                        <div class="faq-item__content">
                            <p>Autem ut suscipit, quibusdam officia, perferendis odio neque eius similique quae ipsum dolor voluptas sequi recusandae dolorem assumenda asperiores deleniti numquam iste fugit eligendi voluptates aliquam voluptate. Quas, magni excepturi ab, dolore explicabo  .</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-item__title">
                            <h5 class="title">01. How do I create Casine Account ?</h5>
                        </div>
                        <div class="faq-item__content">
                            <p>Autem ut suscipit, quibusdam officia, perferendis odio neque eius similique quae ipsum dolor voluptas sequi recusandae dolorem assumenda asperiores deleniti numquam iste fugit eligendi voluptates aliquam voluptate. Quas, magni excepturi ab, dolore explicabo  .</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-item__title">
                            <h5 class="title">01. How do I create Casine Account ?</h5>
                        </div>
                        <div class="faq-item__content">
                            <p>Autem ut suscipit, quibusdam officia, perferendis odio neque eius similique quae ipsum dolor voluptas sequi recusandae dolorem assumenda asperiores deleniti numquam iste fugit eligendi voluptates aliquam voluptate. Quas, magni excepturi ab, dolore explicabo  .</p>
                        </div>
                    </div>
                    <div class="faq-item mb-2 mb-lg-0">
                        <div class="faq-item__title">
                            <h5 class="title">01. How do I create Casine Account ?</h5>
                        </div>
                        <div class="faq-item__content">
                            <p>Autem ut suscipit, quibusdam officia, perferendis odio neque eius similique quae ipsum dolor voluptas sequi recusandae dolorem assumenda asperiores deleniti numquam iste fugit eligendi voluptates aliquam voluptate. Quas, magni excepturi ab, dolore explicabo  .</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="faq-item">
                        <div class="faq-item__title">
                            <h5 class="title">01. How do I create Casine Account ?</h5>
                        </div>
                        <div class="faq-item__content">
                            <p>Autem ut suscipit, quibusdam officia, perferendis odio neque eius similique quae ipsum dolor voluptas sequi recusandae dolorem assumenda asperiores deleniti numquam iste fugit eligendi voluptates aliquam voluptate. Quas, magni excepturi ab, dolore explicabo  .</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-item__title">
                            <h5 class="title">01. How do I create Casine Account ?</h5>
                        </div>
                        <div class="faq-item__content">
                            <p>Autem ut suscipit, quibusdam officia, perferendis odio neque eius similique quae ipsum dolor voluptas sequi recusandae dolorem assumenda asperiores deleniti numquam iste fugit eligendi voluptates aliquam voluptate. Quas, magni excepturi ab, dolore explicabo  .</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-item__title">
                            <h5 class="title">01. How do I create Casine Account ?</h5>
                        </div>
                        <div class="faq-item__content">
                            <p>Autem ut suscipit, quibusdam officia, perferendis odio neque eius similique quae ipsum dolor voluptas sequi recusandae dolorem assumenda asperiores deleniti numquam iste fugit eligendi voluptates aliquam voluptate. Quas, magni excepturi ab, dolore explicabo  .</p>
                        </div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-item__title">
                            <h5 class="title">01. How do I create Casine Account ?</h5>
                        </div>
                        <div class="faq-item__content">
                            <p>Autem ut suscipit, quibusdam officia, perferendis odio neque eius similique quae ipsum dolor voluptas sequi recusandae dolorem assumenda asperiores deleniti numquam iste fugit eligendi voluptates aliquam voluptate. Quas, magni excepturi ab, dolore explicabo  .</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="shapes">
            <img src="assets/images/faq/shape.png" alt="faq" class="shape shape1">
        </div>
    </section>
    <!-- Faq Section Ends Here -->


    <!-- Top Investor & Winner Section Starts Here -->
    <section class="top-section padding-top padding-bottom bg_img" style="background:url(assets/images/top/bg.png) center">
        <div class="container">
            <div class="row align-items-center gy-5">
                <div class="col-lg-4">
                    <h3 class="part-title mb-4">Latest Winner</h3>
                    <div class="top-investor-slider">
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item1.png" alt="top">
                                <p class="amount">₹150</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Munna Ahmed</h6>
                            </div>
                        </div>
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item2.png" alt="top">
                                <p class="amount">₹170</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Fahad Bin</h6>
                            </div>
                        </div>
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item3.png" alt="top">
                                <p class="amount">₹12000</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Rafuj Raiha</h6>
                            </div>
                        </div>
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item1.png" alt="top">
                                <p class="amount">₹150</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Munna Ahmed</h6>
                            </div>
                        </div>
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item3.png" alt="top">
                                <p class="amount">₹10</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Rafuj Raihan</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="cla-wrapper text-center">
                        <h3 class="title mb-4">WIN !!! & <br> Get million dollars</h3>
                        <a href="#0" class="cmn--btn active btn--md radius-0">Play Now</a>
                        <div class="thumb">
                            <img src="assets/images/top/bg2.png" alt="top">
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <h3 class="part-title mb-4">Top Investor</h3>
                    <div class="top-investor-slider">
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item1.png" alt="top">
                                <p class="amount">₹150</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Munna Ahmed</h6>
                            </div>
                        </div>
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item2.png" alt="top">
                                <p class="amount">₹170</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Fahad Bin</h6>
                            </div>
                        </div>
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item3.png" alt="top">
                                <p class="amount">₹12000</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Rafuj Raiha</h6>
                            </div>
                        </div>
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item1.png" alt="top">
                                <p class="amount">₹150</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Munna Ahmed</h6>
                            </div>
                        </div>
                        <div class="investor-item">
                            <div class="investor-item__thumb">
                                <img src="assets/images/top/item3.png" alt="top">
                                <p class="amount">₹10</p>
                            </div>
                            <div class="investor-item__content">
                                <h6 class="name">Rafuj Raihan</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Top Investor & Winner Section Ends Here -->


    <!-- Testimonial Section Starts Here -->
    <section class="testimonial-section padding-top padding-bottom overflow-hidden">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-7 col-xl-6">
                    <div class="section-header text-center">
                        <h2 class="section-header__title">What Casino Players Say</h2>
                        <p>A casino is a facility for certain types of gambling. Casinos are often built combined with hotels, resorts.</p>
                    </div>
                </div>
            </div>
            <div class="testimonial-slider">
                <div class="single-slide">
                    <div class="testimonial-item bg_img" style="background: url(assets/images/testimonial/bg.png) center">
                        <div class="testimonial-inner">
                            <div class="testimonial-item__content">
                                <div class="quote-icon"><i class="las la-quote-left"></i></div>
                                <p>Ducimus ullam omnis eius unde ipsa minus excepturi pariatur! Vel sint cumque expedita  eveniet commodi asp voluptas recusandae voluptatem, accusantium in.</p>
                            </div>
                            <div class="thumb-wrapper">
                                <div class="thumb">
                                    <img src="assets/images/top/item1.png" alt="top">
                                </div>
                                <div class="content">
                                    <h6 class="name">Suraiya Nesa</h6>
                                    <span class="designation">Top Pocker</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="single-slide">
                    <div class="testimonial-item bg_img" style="background: url(assets/images/testimonial/bg.png) center">
                        <div class="testimonial-inner">
                            <div class="testimonial-item__content">
                                <div class="quote-icon"><i class="las la-quote-left"></i></div>
                                <p>Ducimus ullam omnis eius unde ipsa minus excepturi pariatur! Vel sint cumque expedita  eveniet commodi asp voluptas recusandae voluptatem, accusantium in.</p>
                            </div>
                            <div class="thumb-wrapper">
                                <div class="thumb">
                                    <img src="assets/images/top/item2.png" alt="top">
                                </div>
                                <div class="content">
                                    <h6 class="name">Munna Ahmed</h6>
                                    <span class="designation">Top Pocker</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="single-slide">
                    <div class="testimonial-item bg_img" style="background: url(assets/images/testimonial/bg.png) center">
                        <div class="testimonial-inner">
                            <div class="testimonial-item__content">
                                <div class="quote-icon"><i class="las la-quote-left"></i></div>
                                <p>Ducimus ullam omnis eius unde ipsa minus excepturi pariatur! Vel sint cumque expedita  eveniet commodi asp voluptas recusandae voluptatem, accusantium in.</p>
                            </div>
                            <div class="thumb-wrapper">
                                <div class="thumb">
                                    <img src="assets/images/top/item3.png" alt="top">
                                </div>
                                <div class="content">
                                    <h6 class="name">Rafuj Raihan</h6>
                                    <span class="designation">Top Pocker</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="single-slide">
                    <div class="testimonial-item bg_img" style="background: url(assets/images/testimonial/bg.png) center">
                        <div class="testimonial-inner">
                            <div class="testimonial-item__content">
                                <div class="quote-icon"><i class="las la-quote-left"></i></div>
                                <p>Ducimus ullam omnis eius unde ipsa minus excepturi pariatur! Vel sint cumque expedita  eveniet commodi asp voluptas recusandae voluptatem, accusantium in.</p>
                            </div>
                            <div class="thumb-wrapper">
                                <div class="thumb">
                                    <img src="assets/images/top/item2.png" alt="top">
                                </div>
                                <div class="content">
                                    <h6 class="name">Fahad Foiz</h6>
                                    <span class="designation">Top Pocker</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="shapes">
            <img src="assets/images/why/shape.png" alt="why" class="shape shape1">
        </div>
    </section>
    <!-- Testimonial Section Ends Here -->


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