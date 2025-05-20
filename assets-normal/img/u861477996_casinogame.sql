-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 20, 2025 at 03:21 AM
-- Server version: 10.11.10-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u861477996_casinogame`
--

-- --------------------------------------------------------

--
-- Table structure for table `allocated_rm`
--

CREATE TABLE `allocated_rm` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `po_id` bigint(20) UNSIGNED NOT NULL,
  `rm_code` varchar(255) NOT NULL,
  `allocated_quantity` int(11) NOT NULL,
  `reaining_quantity` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:76:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:10:\"view users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:12:\"create users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:10:\"edit users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:12:\"delete users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:21:\"addFundSubadmin users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:20:\"addFundStockit users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:21:\"addFundRetailer users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:13:\"addfund users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:15:\"storefund users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:22:\"superadmin-table users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:20:\"subadmin-table users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:19:\"stockit-table users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:20:\"retailer-table users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:18:\"import-store games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:12:\"import games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:13:\"suspend games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:10:\"view games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:13:\"destroy games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:18;a:4:{s:1:\"a\";i:19;s:1:\"b\";s:12:\"update games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:19;a:4:{s:1:\"a\";i:20;s:1:\"b\";s:10:\"edit games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:20;a:4:{s:1:\"a\";i:21;s:1:\"b\";s:11:\"store games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:21;a:4:{s:1:\"a\";i:22;s:1:\"b\";s:12:\"create games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:22;a:4:{s:1:\"a\";i:23;s:1:\"b\";s:11:\"index games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:23;a:4:{s:1:\"a\";i:24;s:1:\"b\";s:13:\"viewone games\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:24;a:4:{s:1:\"a\";i:25;s:1:\"b\";s:12:\"view players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:25;a:4:{s:1:\"a\";i:26;s:1:\"b\";s:14:\"create players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:26;a:4:{s:1:\"a\";i:27;s:1:\"b\";s:13:\"store players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:27;a:4:{s:1:\"a\";i:28;s:1:\"b\";s:12:\"edit players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:28;a:4:{s:1:\"a\";i:29;s:1:\"b\";s:14:\"update players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:29;a:4:{s:1:\"a\";i:30;s:1:\"b\";s:15:\"destroy players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:30;a:4:{s:1:\"a\";i:31;s:1:\"b\";s:15:\"viewone players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:31;a:4:{s:1:\"a\";i:32;s:1:\"b\";s:15:\"addfund players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:32;a:4:{s:1:\"a\";i:33;s:1:\"b\";s:17:\"storefund players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:33;a:4:{s:1:\"a\";i:34;s:1:\"b\";s:25:\"winningpercentage players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:34;a:4:{s:1:\"a\";i:35;s:1:\"b\";s:21:\"overidechance players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:35;a:4:{s:1:\"a\";i:36;s:1:\"b\";s:20:\"createticket players\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:36;a:4:{s:1:\"a\";i:37;s:1:\"b\";s:13:\"view subadmin\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:37;a:4:{s:1:\"a\";i:38;s:1:\"b\";s:15:\"create subadmin\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:38;a:4:{s:1:\"a\";i:39;s:1:\"b\";s:14:\"store subadmin\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:39;a:4:{s:1:\"a\";i:40;s:1:\"b\";s:13:\"edit subadmin\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:40;a:4:{s:1:\"a\";i:41;s:1:\"b\";s:17:\"view-one subadmin\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:41;a:4:{s:1:\"a\";i:42;s:1:\"b\";s:15:\"update subadmin\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:42;a:4:{s:1:\"a\";i:43;s:1:\"b\";s:13:\"view retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:43;a:4:{s:1:\"a\";i:44;s:1:\"b\";s:14:\"store retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:44;a:4:{s:1:\"a\";i:45;s:1:\"b\";s:15:\"create retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:45;a:4:{s:1:\"a\";i:46;s:1:\"b\";s:13:\"edit retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:46;a:4:{s:1:\"a\";i:47;s:1:\"b\";s:15:\"update retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:47;a:4:{s:1:\"a\";i:48;s:1:\"b\";s:17:\"view-one retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:48;a:4:{s:1:\"a\";i:49;s:1:\"b\";s:21:\"createticket retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:49;a:4:{s:1:\"a\";i:50;s:1:\"b\";s:16:\"view-one stockit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:50;a:4:{s:1:\"a\";i:51;s:1:\"b\";s:12:\"view stockit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:51;a:4:{s:1:\"a\";i:52;s:1:\"b\";s:14:\"create stockit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:52;a:4:{s:1:\"a\";i:53;s:1:\"b\";s:13:\"store stockit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:53;a:4:{s:1:\"a\";i:54;s:1:\"b\";s:12:\"edit stockit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:54;a:4:{s:1:\"a\";i:55;s:1:\"b\";s:14:\"update stockit\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:55;a:4:{s:1:\"a\";i:56;s:1:\"b\";s:11:\"view claims\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:56;a:4:{s:1:\"a\";i:57;s:1:\"b\";s:13:\"create claims\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:57;a:4:{s:1:\"a\";i:58;s:1:\"b\";s:12:\"store claims\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:58;a:4:{s:1:\"a\";i:59;s:1:\"b\";s:11:\"edit claims\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:59;a:4:{s:1:\"a\";i:60;s:1:\"b\";s:13:\"update claims\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:60;a:4:{s:1:\"a\";i:61;s:1:\"b\";s:15:\"view-one claims\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:3;}}i:61;a:3:{s:1:\"a\";i:62;s:1:\"b\";s:18:\"viewticket players\";s:1:\"c\";s:3:\"web\";}i:62;a:3:{s:1:\"a\";i:63;s:1:\"b\";s:19:\"storeticket players\";s:1:\"c\";s:3:\"web\";}i:63;a:3:{s:1:\"a\";i:64;s:1:\"b\";s:15:\"viewall reports\";s:1:\"c\";s:3:\"web\";}i:64;a:3:{s:1:\"a\";i:65;s:1:\"b\";s:12:\"view reports\";s:1:\"c\";s:3:\"web\";}i:65;a:3:{s:1:\"a\";i:66;s:1:\"b\";s:13:\"admin reports\";s:1:\"c\";s:3:\"web\";}i:66;a:4:{s:1:\"a\";i:67;s:1:\"b\";s:12:\"admin report\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:67;a:4:{s:1:\"a\";i:68;s:1:\"b\";s:14:\"stockit report\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:68;a:4:{s:1:\"a\";i:69;s:1:\"b\";s:15:\"retailer report\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:69;a:3:{s:1:\"a\";i:70;s:1:\"b\";s:13:\"accept claims\";s:1:\"c\";s:3:\"web\";}i:70;a:3:{s:1:\"a\";i:71;s:1:\"b\";s:13:\"reject claims\";s:1:\"c\";s:3:\"web\";}i:71;a:4:{s:1:\"a\";i:72;s:1:\"b\";s:26:\"playergameResults retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:72;a:4:{s:1:\"a\";i:73;s:1:\"b\";s:24:\"turnoverHistory retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:73;a:4:{s:1:\"a\";i:74;s:1:\"b\";s:22:\"playerhistory retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:74;a:4:{s:1:\"a\";i:75;s:1:\"b\";s:27:\"transactionhistory retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:75;a:4:{s:1:\"a\";i:76;s:1:\"b\";s:23:\"resultshistory retailer\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}}s:5:\"roles\";a:3:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:11:\"Super Admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:7:\"Stockit\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:8:\"Retailer\";s:1:\"c\";s:3:\"web\";}}}', 1747485569),
('stockit@gail.com|127.0.0.1', 'i:1;', 1745930764),
('stockit@gail.com|127.0.0.1:timer', 'i:1745930764;', 1745930764),
('stockit1@gail.com|127.0.0.1', 'i:1;', 1745948242),
('stockit1@gail.com|127.0.0.1:timer', 'i:1745948242;', 1745948242),
('stockit4@gmail.com|127.0.0.1', 'i:1;', 1745941165),
('stockit4@gmail.com|127.0.0.1:timer', 'i:1745941165;', 1745941165);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `claim_point_data`
--

CREATE TABLE `claim_point_data` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `claim_point` int(11) NOT NULL DEFAULT 0,
  `unclaim_point` int(11) NOT NULL DEFAULT 0,
  `balance` int(11) NOT NULL DEFAULT 0,
  `auto_claim` tinyint(1) NOT NULL DEFAULT 0,
  `ticket_serial` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fg_production`
--

CREATE TABLE `fg_production` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `po_id` bigint(20) UNSIGNED NOT NULL,
  `item_code` varchar(255) NOT NULL,
  `hsn_sac_code` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `item_description` text NOT NULL,
  `expected_prod_complete_date` date NOT NULL,
  `status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `finished_goods`
--

CREATE TABLE `finished_goods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `material_code` varchar(255) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `hsn_sac_code` varchar(255) NOT NULL,
  `initial_stock_quantity` int(11) NOT NULL,
  `plant_allocated_quantity` int(11) NOT NULL DEFAULT 0,
  `status` enum('available','unavailable','low_stock','deleted') NOT NULL DEFAULT 'available',
  `reorder_level` int(11) DEFAULT NULL,
  `buffer_stock` int(11) DEFAULT NULL,
  `unit_of_measurement` varchar(255) NOT NULL,
  `date_of_entry` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `funds`
--

CREATE TABLE `funds` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `from_id` int(11) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reference_number` varchar(255) NOT NULL,
  `modeOfPayment` enum('Cr','Dr') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `game_name` varchar(255) NOT NULL,
  `game_type` varchar(255) NOT NULL,
  `game_category` varchar(255) NOT NULL,
  `game_spin_time` int(11) NOT NULL,
  `min_bet` decimal(10,2) NOT NULL,
  `maximum_bet` decimal(10,2) NOT NULL,
  `winning_percentage` double NOT NULL,
  `override_chance` double NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`id`, `game_name`, `game_type`, `game_category`, `game_spin_time`, `min_bet`, `maximum_bet`, `winning_percentage`, `override_chance`, `created_at`, `updated_at`) VALUES
(1, 'Poker Roulette', 'Automatic', 'Roulette', 124, 0.00, 10000.00, 70, 0.3, '2025-04-30 10:16:12', '2025-04-30 10:16:12');

-- --------------------------------------------------------

--
-- Table structure for table `game_history`
--

CREATE TABLE `game_history` (
  `id` int(11) NOT NULL,
  `game_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`history`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `game_results`
--

CREATE TABLE `game_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `winning_number` int(11) DEFAULT NULL,
  `lose_number` int(11) DEFAULT NULL,
  `suiticonnum` int(11) NOT NULL,
  `bet` decimal(10,2) DEFAULT NULL,
  `win_value` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_12_10_101059_create_personal_access_tokens_table', 2),
(5, '2024_12_10_121915_create_permission_tables', 3),
(6, '2024_12_17_094909_create_raw_materials_table', 4),
(7, '2024_12_17_124018_create_finished_goods_table', 4),
(8, '2024_12_23_090917_update_users_table', 5),
(9, '2024_12_26_125933_update_raw_material_table', 6),
(10, '2024_12_30_074409_add_columns_to_finished_goods_table', 6),
(11, '2025_01_06_123954_create_plants_table', 7),
(12, '2025_01_08_040034_add_address_columns_to_plants_table', 8),
(13, '2025_01_09_035122_add_company_details_to_users_table', 8),
(14, '2025_01_09_063453_add_effective_date_to_users_table', 8),
(15, '2025_01_09_120035_remove_location_from_plants_table', 9),
(16, '2025_01_09_134641_add_finished_goods_to_plants_table', 9),
(17, '2025_01_10_090937_create_purchase_orders_table', 10),
(18, '2025_01_10_091003_create_ordered_items_table', 10),
(19, '2025_01_11_141058_remove_ordered_items_id_from_purchase_orders', 10),
(20, '2025_01_11_142128_add_po_id_to_purchase_orders', 10),
(21, '2025_01_15_083144_modify_status_column_in_users_table', 10),
(22, '2025_01_23_040127_create_raw_materials_and_finished_goods_tables', 11),
(23, '2025_01_24_090457_create_plant_finished_goods_table', 12),
(24, '2025_01_24_095502_add_plant_allocated_quantity_to_finished_goods_table', 13),
(25, '2025_01_25_064835_create_finished_good_raw_material_table', 14),
(26, '2025_01_25_072326_add_unit_to_finished_good_raw_material_table', 15),
(27, '2025_01_25_101121_update_status_and_add_status_reason_to_purchase_orders_table', 16),
(28, '2025_01_25_105749_remove_unique_from_item_code_in_ordered_items', 17),
(29, '2025_01_25_121816_add_raw_materials_to_plants_table', 18),
(30, '2025_01_25_123623_create_plant_raw_material_table', 19),
(32, '2025_01_26_060859_add_plant_allocated_quantity_to_raw_materials_table', 20),
(34, '2025_01_26_064010_rename_finished_good_id_to_raw_material_id_in_plant_raw_material_table', 21),
(35, '2025_01_26_092601_create_vendor_purchase_orders_table', 22),
(36, '2025_01_26_092645_create_vendor_ordered_items_table', 22),
(37, '2025_01_26_143921_change_quantity_column_in_plant_raw_material', 23),
(38, '2025_01_27_154148_update_order_status_columns', 24),
(39, '2025_02_01_094830_add_price_to_finished_good_raw_material_table', 25),
(40, '2025_02_01_094958_add_price_to_finished_good_raw_material_table', 26),
(41, '2025_02_01_103629_create_contact_seller_table', 27),
(42, '2025_02_01_110939_add_po_id_to_contact_seller_table', 28),
(43, '2025_02_01_131201_add_invoice_file_to_vendor_purchase_orders_table', 29),
(44, '2025_02_03_034106_create_vendor_shipping_details_table', 30),
(45, '2025_02_20_045510_create_fg_production_table', 31),
(46, '2025_02_21_182538_modify_order_status_in_purchase_orders', 31),
(47, '2025_02_22_114952_fix_raw_material_foreign_key_on_plant_raw_material_table', 31),
(48, '2025_02_26_042217_create_notifications_table', 32),
(51, '2025_03_01_085308_add_po_id_to_vendor_shipping_details', 33),
(52, '2025_03_02_091549_update_order_status_enum_in_purchase_orders', 34),
(54, '2025_03_02_104952_update_order_status_enum_in_purchase_orders', 35),
(55, '2025_03_02_191547_update_order_status_enum_in_purchase_orders', 36),
(56, '2025_03_03_034632_add_purpose_to_notifications_table', 37),
(57, '2025_03_03_044931_update_order_status_enum_in_purchase_orders_new', 38),
(58, '2025_03_05_071014_add_reorder_level_and_buffer_stock_to_plant_finished_goods_table', 39),
(59, '2025_03_05_080601_add_minimum_threshold_and_buffer_stock_to_plant_raw_material_table', 39),
(62, '2025_03_15_044441_remove_raw_materials_used_from_finished_goods', 40),
(63, '2025_03_15_054406_update_finished_good_raw_material_table', 41),
(64, '2025_03_16_020521_update_status_column_in_plant_raw_material_table', 42),
(65, '2025_03_17_024531_add_item_description_to_ordered_items_table', 43),
(66, '2025_03_17_053032_update_status_columns_in_purchase_orders_and_ordered_items_tables', 44),
(67, '2025_03_20_120039_add_rm_code_and_minimum_rm_quantity_to_users_table', 45),
(68, '2025_03_26_021403_create_allocated_rm_table', 46),
(69, '2025_03_26_091008_add_order_hash_to_vendor_purchase_orders_table', 47),
(70, '2025_03_31_024219_create_settings_table', 48),
(72, '2025_03_31_030419_create_daily_mrp_reports_table', 49),
(77, '2025_04_13_005710_update_order_status_in_purchase_orders_table', 50),
(78, '2025_04_13_010040_update_status_in_ordered_items_table', 50),
(79, '2025_04_16_123019_add_client_po_id_to_vendor_purchase_orders_table', 51),
(81, '2025_04_19_082515_create_user_points_sales_table', 52),
(82, '2025_05_07_010221_create_total_bet_history_table', 53),
(83, '2025_05_07_050059_add_winning_percentage_and_override_chance_to_games_table', 54),
(86, '2025_05_09_025813_create_overall_game_record_table', 55),
(87, '2025_05_09_035839_create_claim_point_data_table', 55),
(88, '2025_05_11_024437_create_overall_gm_rec_cpy_table', 56);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(2, 'App\\Models\\User', 3),
(2, 'App\\Models\\User', 8),
(3, 'App\\Models\\User', 4),
(3, 'App\\Models\\User', 5),
(3, 'App\\Models\\User', 6),
(3, 'App\\Models\\User', 7),
(3, 'App\\Models\\User', 9),
(3, 'App\\Models\\User', 10),
(3, 'App\\Models\\User', 11),
(3, 'App\\Models\\User', 12);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `from_id` bigint(20) UNSIGNED NOT NULL,
  `to_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `status` enum('unread','read') NOT NULL DEFAULT 'unread',
  `notification_text` text NOT NULL,
  `notification_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `from_id`, `to_id`, `type`, `purpose`, `status`, `notification_text`, `notification_url`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'created', 'client_created', 'unread', 'New Client Added successfully.', 'clients', '2025-05-14 20:43:44', '2025-05-14 20:43:44'),
(2, 1, 1, 'created', 'client_created', 'unread', 'New Client Added successfully.', 'clients', '2025-05-16 07:12:38', '2025-05-16 07:12:38'),
(3, 1, 1, 'created', 'client_created', 'unread', 'New Client Added successfully.', 'clients', '2025-05-16 07:13:13', '2025-05-16 07:13:13'),
(4, 1, 1, 'created', 'client_created', 'unread', 'New Client Added successfully.', 'clients', '2025-05-16 07:13:54', '2025-05-16 07:13:54'),
(5, 1, 1, 'created', 'client_created', 'unread', 'New Client Added successfully.', 'clients', '2025-05-16 07:14:37', '2025-05-16 07:14:37'),
(6, 1, 1, 'created', 'client_created', 'unread', 'New Client Added successfully.', 'clients', '2025-05-17 00:25:37', '2025-05-17 00:25:37'),
(7, 1, 1, 'created', 'client_created', 'unread', 'New Client Added successfully.', 'clients', '2025-05-17 00:26:16', '2025-05-17 00:26:16'),
(8, 1, 1, 'created', 'client_created', 'unread', 'New Client Added successfully.', 'clients', '2025-05-17 00:31:19', '2025-05-17 00:31:19');

-- --------------------------------------------------------

--
-- Table structure for table `overall_game_record`
--

CREATE TABLE `overall_game_record` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `choosenindex` int(11) NOT NULL,
  `winningpoint` float NOT NULL DEFAULT 0,
  `currentwinningPercentage` float NOT NULL DEFAULT 0,
  `totalSaleToday` float NOT NULL DEFAULT 0,
  `totalWinToday` float NOT NULL DEFAULT 0,
  `winningPercentage` float NOT NULL DEFAULT 0,
  `overrideChance` float DEFAULT NULL,
  `userwins` varchar(255) DEFAULT NULL,
  `allSametxt` varchar(255) DEFAULT NULL,
  `minvalue` float NOT NULL DEFAULT 0,
  `withdraw_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `overall_gm_rec_cpy`
--

CREATE TABLE `overall_gm_rec_cpy` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `choosenindex` int(11) NOT NULL,
  `winningpoint` double NOT NULL DEFAULT 0,
  `currentwinningPercentage` double NOT NULL DEFAULT 0,
  `totalSaleToday` double NOT NULL DEFAULT 0,
  `totalWinToday` double NOT NULL DEFAULT 0,
  `winningPercentage` double NOT NULL DEFAULT 0,
  `overrideChance` double DEFAULT NULL,
  `userwins` varchar(255) DEFAULT NULL,
  `allSametxt` varchar(255) DEFAULT NULL,
  `minvalue` double NOT NULL DEFAULT 0,
  `withdraw_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'view users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(2, 'create users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(3, 'edit users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(4, 'delete users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(5, 'addFundSubadmin users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(6, 'addFundStockit users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(7, 'addFundRetailer users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(8, 'addfund users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(9, 'storefund users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(10, 'superadmin-table users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(11, 'subadmin-table users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(12, 'stockit-table users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(13, 'retailer-table users', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(14, 'import-store games', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(15, 'import games', 'web', '2025-04-19 03:26:38', '2025-04-19 03:26:38'),
(16, 'suspend games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(17, 'view games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(18, 'destroy games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(19, 'update games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(20, 'edit games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(21, 'store games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(22, 'create games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(23, 'index games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(24, 'viewone games', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(25, 'view players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(26, 'create players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(27, 'store players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(28, 'edit players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(29, 'update players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(30, 'destroy players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(31, 'viewone players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(32, 'addfund players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(33, 'storefund players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(34, 'winningpercentage players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(35, 'overidechance players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(36, 'createticket players', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(37, 'view subadmin', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(38, 'create subadmin', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(39, 'store subadmin', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(40, 'edit subadmin', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(41, 'view-one subadmin', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(42, 'update subadmin', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(43, 'view retailer', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(44, 'store retailer', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(45, 'create retailer', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(46, 'edit retailer', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(47, 'update retailer', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(48, 'view-one retailer', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(49, 'createticket retailer', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(50, 'view-one stockit', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(51, 'view stockit', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(52, 'create stockit', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(53, 'store stockit', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(54, 'edit stockit', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(55, 'update stockit', 'web', '2025-04-19 03:26:39', '2025-04-19 03:26:39'),
(56, 'view claims', 'web', '2025-04-19 20:39:57', '2025-04-19 20:39:57'),
(57, 'create claims', 'web', '2025-04-19 20:40:05', '2025-04-19 20:40:05'),
(58, 'store claims', 'web', '2025-04-19 20:40:13', '2025-04-19 20:40:13'),
(59, 'edit claims', 'web', '2025-04-19 20:40:18', '2025-04-19 20:40:18'),
(60, 'update claims', 'web', '2025-04-19 20:40:28', '2025-04-19 20:40:28'),
(61, 'view-one claims', 'web', '2025-04-19 20:40:41', '2025-04-19 20:40:41'),
(62, 'viewticket players', 'web', '2025-04-19 20:41:02', '2025-04-19 20:41:02'),
(63, 'storeticket players', 'web', '2025-04-19 20:41:11', '2025-04-19 20:41:11'),
(64, 'viewall reports', 'web', '2025-04-21 04:06:18', '2025-04-21 04:06:18'),
(65, 'view reports', 'web', '2025-04-21 04:06:25', '2025-04-21 04:06:25'),
(66, 'admin reports', 'web', '2025-04-21 04:06:30', '2025-04-21 04:06:30'),
(67, 'admin report', 'web', '2025-04-21 04:06:44', '2025-04-21 04:06:44'),
(68, 'stockit report', 'web', '2025-04-21 04:06:54', '2025-04-21 04:06:54'),
(69, 'retailer report', 'web', '2025-04-21 04:07:02', '2025-04-21 04:07:02'),
(70, 'accept claims', 'web', '2025-04-21 04:07:53', '2025-04-21 04:07:53'),
(71, 'reject claims', 'web', '2025-04-21 04:08:00', '2025-04-21 04:08:00'),
(72, 'playergameResults retailer', 'web', '2025-04-28 20:38:00', '2025-04-28 20:38:00'),
(73, 'turnoverHistory retailer', 'web', '2025-04-28 20:58:42', '2025-04-28 20:58:42'),
(74, 'playerhistory retailer', 'web', '2025-04-28 20:58:51', '2025-04-28 20:58:51'),
(75, 'transactionhistory retailer', 'web', '2025-04-28 20:59:01', '2025-04-28 20:59:01'),
(76, 'resultshistory retailer', 'web', '2025-04-28 20:59:09', '2025-04-28 20:59:09');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plants`
--

CREATE TABLE `plants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plant_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_goods` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` enum('active','maintenance','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `capacity` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zip` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raw_materials` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plant_finished_goods`
--

CREATE TABLE `plant_finished_goods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plant_id` bigint(20) UNSIGNED NOT NULL,
  `finished_good_id` bigint(20) UNSIGNED NOT NULL,
  `item_code` varchar(255) NOT NULL,
  `item_description` varchar(255) NOT NULL,
  `hsn_sac_code` varchar(255) NOT NULL,
  `status` enum('available','unavailable','low_stock') NOT NULL DEFAULT 'available',
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `reorder_level` int(11) DEFAULT NULL,
  `buffer_stock` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plant_raw_material`
--

CREATE TABLE `plant_raw_material` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plant_id` bigint(20) UNSIGNED NOT NULL,
  `raw_material_id` bigint(20) UNSIGNED NOT NULL,
  `item_code` varchar(255) NOT NULL,
  `item_description` varchar(255) NOT NULL,
  `hsn_sac_code` varchar(255) NOT NULL,
  `status` enum('available','unavailable','low_stock') NOT NULL DEFAULT 'available',
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `minimum_threshold` int(11) DEFAULT NULL,
  `buffer_stock` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `po_number` varchar(255) NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `plant_id` bigint(20) UNSIGNED NOT NULL,
  `order_status` enum('pending_for_approval','completed','production_initiated','cancelled','on_hold','deleted','in_progress','release_initiated','insufficient_fg','account_referred','ready_dispatched','dispatched','add_fg','add_rm','added_fg','added_rm','rejected','insufficient_rm','allocated_rm') NOT NULL,
  `client_status` enum('pending','in_process','dispatched','completed') NOT NULL DEFAULT 'pending',
  `po_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `ordered_items_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `raw_materials`
--

CREATE TABLE `raw_materials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `material_code` varchar(255) NOT NULL,
  `material_name` varchar(255) NOT NULL,
  `hsn_sac_code` varchar(255) DEFAULT NULL,
  `initial_stock_quantity` int(11) NOT NULL DEFAULT 0,
  `plant_allocated_quantity` int(11) NOT NULL DEFAULT 0,
  `status` enum('available','unavailable','low_stock','deleted') NOT NULL DEFAULT 'available',
  `minimum_threshold` int(11) NOT NULL,
  `buffer_stock` int(11) NOT NULL DEFAULT 10,
  `unit_of_measurement` varchar(255) NOT NULL,
  `date_of_entry` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'web', '2025-04-19 03:20:28', '2025-04-19 03:20:28'),
(2, 'Stockit', 'web', '2025-04-19 03:27:57', '2025-04-19 03:27:57'),
(3, 'Retailer', 'web', '2025-04-19 03:28:18', '2025-04-19 03:28:18');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(25, 2),
(25, 3),
(26, 1),
(26, 2),
(26, 3),
(27, 1),
(27, 2),
(27, 3),
(28, 1),
(28, 2),
(28, 3),
(29, 1),
(29, 2),
(29, 3),
(30, 1),
(30, 2),
(30, 3),
(31, 1),
(31, 2),
(31, 3),
(32, 1),
(32, 2),
(32, 3),
(33, 1),
(33, 2),
(33, 3),
(34, 1),
(34, 2),
(34, 3),
(35, 1),
(35, 2),
(35, 3),
(36, 1),
(36, 2),
(36, 3),
(37, 1),
(38, 1),
(39, 1),
(40, 1),
(41, 1),
(42, 1),
(43, 1),
(43, 2),
(44, 1),
(44, 2),
(45, 1),
(45, 2),
(46, 1),
(46, 2),
(47, 1),
(47, 2),
(48, 1),
(48, 2),
(49, 1),
(49, 2),
(50, 1),
(51, 1),
(52, 1),
(53, 1),
(54, 1),
(55, 1),
(56, 3),
(57, 3),
(58, 3),
(59, 3),
(60, 3),
(61, 3),
(67, 1),
(68, 1),
(69, 1),
(72, 1),
(72, 2),
(72, 3),
(73, 1),
(73, 2),
(73, 3),
(74, 1),
(74, 2),
(74, 3),
(75, 1),
(75, 2),
(75, 3),
(76, 1),
(76, 2),
(76, 3);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('0tsmfi27MR2uBqkSGBl0TuL1z1qqvDkjkNKgUmY5', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoia212bWQzRmdBQXUxNVhjTHUyQXNOSEtUeDQxS2Z3TkF5dnJxbUpxUSI7czozOiJ1cmwiO2E6MDp7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6OToiX3ByZXZpb3VzIjthOjE6e3M6MzoidXJsIjtzOjI3OiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvbG9naW4iO31zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO30=', 1747461679),
('DkEvsWZhsJn65vIscSiBWwhJ1W4gUND4wDEMDmK6', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiYW5ZUllDVHNSQ3R2UGkzb09ocGdpY200RXBoMDVNV0dBeUdvNEcwZSI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czoyOToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3BsYXllcnMiO31zOjk6Il9wcmV2aW91cyI7YToxOntzOjM6InVybCI7czoyOToiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3BsYXllcnMiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1747461982);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `serial_number` varchar(255) NOT NULL,
  `bar_code_scanner` varchar(255) DEFAULT NULL,
  `amount` int(11) NOT NULL,
  `card_name` varchar(255) NOT NULL,
  `retailer_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `total_bet_history`
--

CREATE TABLE `total_bet_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `game_id` bigint(20) UNSIGNED NOT NULL,
  `card_type` varchar(255) NOT NULL,
  `bet_amount` decimal(10,2) NOT NULL,
  `withdraw_time` timestamp NULL DEFAULT NULL,
  `ntrack` int(11) DEFAULT NULL,
  `ticket_serial` int(11) DEFAULT NULL,
  `card_bet_amounts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`card_bet_amounts`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `points` int(11) DEFAULT 1000,
  `winning_percentage` decimal(5,2) DEFAULT NULL,
  `stockit_id` int(11) NOT NULL,
  `sub_admin_id` int(11) NOT NULL,
  `retailer_id` int(11) NOT NULL,
  `auto_claim` tinyint(1) NOT NULL DEFAULT 0,
  `override_chance` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `first_name`, `last_name`, `country`, `phone`, `email`, `username`, `password`, `points`, `winning_percentage`, `stockit_id`, `sub_admin_id`, `retailer_id`, `auto_claim`, `override_chance`, `created_at`) VALUES
(1, 'Player', '1', 'India', '06392548192', 'player1@gmail.com', 'player1', '$2y$12$ac/j88eDWT3g1QvwqvL8D.fdSsdUs4NuEiWEmXxeAqCmO3Z3GnPSe', 200000, 70.00, 2, 1, 4, 0, 0.30, '2025-05-16 12:42:38'),
(2, 'Player', '2', 'India', '788894698', 'player2@gmail.com', 'player2', '$2y$12$RBlf4pK/9MA5xYF2fIw8Ze5fDWOvcLv.3CCrHr2FWcqvgBnoc4hM6', 200000, 70.00, 2, 1, 4, 0, 0.30, '2025-05-16 12:43:13'),
(3, 'Player', '3', 'India', '7899874566', 'player3@gmail.com', 'player3', '$2y$12$wlAhlwhtuIGl9lCAVarC.e6PCOXYHMhSvdFommFqt3sstC5WxUDwy', 200000, 70.00, 2, 1, 4, 0, 0.30, '2025-05-16 12:43:54'),
(4, 'Player', '4', 'India', '0392577792', 'player4@gmail.com', 'player4', '$2y$12$Zx6hoTgKGwjtludDXlpI.ejDgNnmPL/vSEFT.GJE9jTsxZ.G4hwbS', 200000, 70.00, 2, 1, 4, 0, 0.30, '2025-05-16 12:44:37'),
(5, 'Player', '5', 'India', '0639254811', 'player5@gmail.com', 'player5', '$2y$12$X77..JeWv0gJlKTvPW9hROWgyhTjjO6AtBleklj5P2qtafyw8dofK', 200000, 70.00, 2, 1, 4, 0, 0.30, '2025-05-17 05:55:37'),
(6, 'Player', '6', 'India', '06392548888', 'player6@gmail.com', 'player6', '$2y$12$4qgrbFNqdB6s/laJiu4A/ex/X1zsoIGCmg2gHCJ1l7kHD0qRGC/O6', 200000, 70.00, 2, 1, 4, 0, 0.30, '2025-05-17 05:56:16'),
(7, 'Player', '7', 'India', '9992548192', 'player7@gmail.com', 'player7', '$2y$12$0VT50aTlQo19kCNte5MRhOZV7ic1RziVGo5bVylfMrORQX948F5hO', 200000, 70.00, 2, 1, 4, 0, 0.30, '2025-05-17 06:01:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_date` date DEFAULT NULL,
  `plant_assigned` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sub_admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `stockit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `mobile_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','pending_approval','inactive','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `company_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gstin_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pan_card` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raw_materials` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `effective_date`, `plant_assigned`, `sub_admin_id`, `stockit_id`, `mobile_number`, `status`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `company_name`, `gstin_number`, `pan_card`, `state_code`, `company_address`, `raw_materials`) VALUES
(1, 'Aayushi Dua', 'admin@gmail.com', NULL, '1', NULL, NULL, '1471583390', 'active', NULL, '$2y$12$R4d/nPBaao0iYaISjLbILOuDT7EAB5zOmtUuijirCchGrT/X2bpFi', NULL, '2025-04-30 09:58:11', '2025-05-12 23:09:17', NULL, NULL, '18000', NULL, NULL, NULL),
(2, 'Stockit1', 'stockit1@gmail.com', NULL, NULL, 1, NULL, '6399225588', 'active', NULL, '$2y$12$.8akdZnEeTEKU.d2uQ8Ngeu18HFI4gJwjQINhD6EiSSkOMwk8BE2e', NULL, '2025-04-30 10:31:20', '2025-05-13 05:24:46', NULL, '3', '6000', NULL, NULL, NULL),
(3, 'Stockit2', 'stockit2@gmail.com', NULL, NULL, 1, NULL, '6392548199', 'pending_approval', NULL, '$2y$12$qUMVGO3oGTlig.I0wg4UPukDl6pKIa/PAN0.DPfnHpuO81NX7ND22', NULL, '2025-04-30 10:34:46', '2025-05-12 23:09:17', NULL, '3', '1000', NULL, NULL, NULL),
(4, 'Retailer1', 'retailer1@gmail.com', NULL, NULL, 1, 2, '6399887755', 'inactive', NULL, '$2y$12$AwuAnRoe/rAu8oeJiH4d5OOOnzCa0E8oHk2aQXqmd1lcJjKJ73nHi', NULL, '2025-04-30 10:36:32', '2025-05-17 00:31:19', 'phone', '3', '2700000', NULL, NULL, NULL),
(5, 'Retailer2', 'retailer2@gmail.com', NULL, NULL, 1, 2, '6392548877', 'active', NULL, '$2y$12$pWAn/x1sexMeH2bYAITUMOIflU69NvPvuEgMIgB8Rv5o.NMXU.OO2', NULL, '2025-04-30 10:37:29', '2025-04-30 10:53:35', 'phone', '3', '200000', NULL, NULL, NULL),
(6, 'Retailer3', 'retailer3@gmail.com', NULL, NULL, 1, 3, '6574825544', 'active', NULL, '$2y$12$GxfJQWaHBncpyA2a6Aykw.QpFcHfPvaJLDBIPU1Tvuhe2rI7fkNLe', NULL, '2025-04-30 10:39:13', '2025-04-30 10:58:22', 'phone', '3', '200000', NULL, NULL, NULL),
(7, 'Retailer4', 'retailer4@gmail.com', NULL, NULL, 1, 3, '6657412354', 'active', NULL, '$2y$12$juydQF3ZICGfC5u5tZvMUeec02mS.UG/v3PxK12FwQ.6kM64KlSxW', NULL, '2025-04-30 10:40:03', '2025-04-30 11:00:23', 'phone', '3', '200000', NULL, NULL, NULL),
(10, 'Retailer5', 'retailer5@gmail.com', NULL, NULL, 1, 2, '6392548866', 'active', NULL, '$2y$12$H/e3tNWT6lGUQ4fYmeGu2uwDoy0sxlgBAV2jSNrncVvO5eiIjWnTi', NULL, '2025-05-05 05:45:04', '2025-05-12 23:32:29', 'desktop', '3', '200000', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_points_claims`
--

CREATE TABLE `user_points_claims` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `from_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference_number` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_points_sales`
--

CREATE TABLE `user_points_sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `from_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reference_number` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_points_sales`
--

INSERT INTO `user_points_sales` (`id`, `from_id`, `user_id`, `amount`, `reference_number`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 200000.00, '66377772', '2025-05-20 07:12:38', '2025-05-16 07:12:38'),
(2, 1, 2, 200000.00, '32470380', '2025-05-20 07:12:38', '2025-05-16 07:13:13'),
(3, 1, 3, 200000.00, '36612237', '2025-05-20 07:12:38', '2025-05-16 07:13:54'),
(4, 1, 4, 200000.00, '24331433', '2025-05-20 07:12:38', '2025-05-16 07:14:37'),
(5, 1, 5, 200000.00, '74592113', '2025-05-20 07:12:38', '2025-05-17 00:25:37'),
(6, 1, 6, 200000.00, '48970143', '2025-05-20 07:12:38', '2025-05-17 00:26:16'),
(7, 1, 7, 200000.00, '29130933', '2025-05-20 07:12:38', '2025-05-17 00:31:19');

-- --------------------------------------------------------

--
-- Table structure for table `vendor_ordered_items`
--

CREATE TABLE `vendor_ordered_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_code` varchar(255) NOT NULL,
  `hsn_sac_code` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `item_description` text DEFAULT NULL,
  `po_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendor_purchase_orders`
--

CREATE TABLE `vendor_purchase_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `po_number` varchar(255) NOT NULL,
  `client_po_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `plant_id` bigint(20) UNSIGNED NOT NULL,
  `order_status` varchar(255) NOT NULL DEFAULT 'pending',
  `po_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `order_hash` varchar(255) DEFAULT NULL,
  `invoice_file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendor_shipping_details`
--

CREATE TABLE `vendor_shipping_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `po_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tracking_number` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `expected_delivery_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `allocated_rm`
--
ALTER TABLE `allocated_rm`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `claim_point_data`
--
ALTER TABLE `claim_point_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `claim_point_data_user_id_foreign` (`user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `fg_production`
--
ALTER TABLE `fg_production`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `finished_goods`
--
ALTER TABLE `finished_goods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `finished_goods_material_code_unique` (`material_code`);

--
-- Indexes for table `funds`
--
ALTER TABLE `funds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `funds_reference_number_unique` (`reference_number`),
  ADD KEY `funds_user_id_foreign` (`user_id`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `games_game_name_unique` (`game_name`);

--
-- Indexes for table `game_history`
--
ALTER TABLE `game_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `game_results`
--
ALTER TABLE `game_results`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_from_id_foreign` (`from_id`),
  ADD KEY `notifications_to_id_foreign` (`to_id`);

--
-- Indexes for table `overall_game_record`
--
ALTER TABLE `overall_game_record`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `overall_gm_rec_cpy`
--
ALTER TABLE `overall_gm_rec_cpy`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `overall_gm_rec_cpy_withdraw_time_unique` (`withdraw_time`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `plants`
--
ALTER TABLE `plants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plant_finished_goods`
--
ALTER TABLE `plant_finished_goods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plant_finished_goods_plant_id_foreign` (`plant_id`),
  ADD KEY `plant_finished_goods_finished_good_id_foreign` (`finished_good_id`);

--
-- Indexes for table `plant_raw_material`
--
ALTER TABLE `plant_raw_material`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plant_raw_material_plant_id_foreign` (`plant_id`),
  ADD KEY `plant_raw_material_finished_good_id_foreign` (`raw_material_id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_orders_po_number_unique` (`po_number`);

--
-- Indexes for table `raw_materials`
--
ALTER TABLE `raw_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `raw_materials_material_code_unique` (`material_code`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tickets_user_id_foreign` (`user_id`);

--
-- Indexes for table `total_bet_history`
--
ALTER TABLE `total_bet_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_sub_admin_id_foreign` (`sub_admin_id`),
  ADD KEY `users_stockit_id_foreign` (`stockit_id`);

--
-- Indexes for table `user_points_claims`
--
ALTER TABLE `user_points_claims`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_points_claims_reference_number_unique` (`reference_number`);

--
-- Indexes for table `user_points_sales`
--
ALTER TABLE `user_points_sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_points_sales_reference_number_unique` (`reference_number`);

--
-- Indexes for table `vendor_ordered_items`
--
ALTER TABLE `vendor_ordered_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_ordered_items_po_id_foreign` (`po_id`);

--
-- Indexes for table `vendor_purchase_orders`
--
ALTER TABLE `vendor_purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_purchase_orders_po_number_unique` (`po_number`),
  ADD KEY `vendor_purchase_orders_plant_id_foreign` (`plant_id`),
  ADD KEY `vendor_purchase_orders_order_hash_index` (`order_hash`);

--
-- Indexes for table `vendor_shipping_details`
--
ALTER TABLE `vendor_shipping_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_shipping_details_tracking_number_unique` (`tracking_number`),
  ADD KEY `vendor_shipping_details_po_id_foreign` (`po_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `allocated_rm`
--
ALTER TABLE `allocated_rm`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `claim_point_data`
--
ALTER TABLE `claim_point_data`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fg_production`
--
ALTER TABLE `fg_production`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `finished_goods`
--
ALTER TABLE `finished_goods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `funds`
--
ALTER TABLE `funds`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `game_history`
--
ALTER TABLE `game_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `game_results`
--
ALTER TABLE `game_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `overall_game_record`
--
ALTER TABLE `overall_game_record`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `overall_gm_rec_cpy`
--
ALTER TABLE `overall_gm_rec_cpy`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plants`
--
ALTER TABLE `plants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plant_finished_goods`
--
ALTER TABLE `plant_finished_goods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `plant_raw_material`
--
ALTER TABLE `plant_raw_material`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `raw_materials`
--
ALTER TABLE `raw_materials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `total_bet_history`
--
ALTER TABLE `total_bet_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_points_claims`
--
ALTER TABLE `user_points_claims`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_points_sales`
--
ALTER TABLE `user_points_sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vendor_ordered_items`
--
ALTER TABLE `vendor_ordered_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendor_purchase_orders`
--
ALTER TABLE `vendor_purchase_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendor_shipping_details`
--
ALTER TABLE `vendor_shipping_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `claim_point_data`
--
ALTER TABLE `claim_point_data`
  ADD CONSTRAINT `claim_point_data_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `funds`
--
ALTER TABLE `funds`
  ADD CONSTRAINT `funds_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `plant_finished_goods`
--
ALTER TABLE `plant_finished_goods`
  ADD CONSTRAINT `plant_finished_goods_finished_good_id_foreign` FOREIGN KEY (`finished_good_id`) REFERENCES `finished_goods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plant_finished_goods_plant_id_foreign` FOREIGN KEY (`plant_id`) REFERENCES `plants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
