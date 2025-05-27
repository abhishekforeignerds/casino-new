import React from "react";
import img1 from "../../assets/mat-card-subtitle → Customers (1).png";
import img2 from "../../assets/mat-card-subtitle → Customers (2).png";
import img3 from "../../assets/mat-card-subtitle → Customers (3).png";
import img4 from "../../assets/mat-card-subtitle → Customers (3).png";
import { usePage, Link } from "@inertiajs/react";

const CardLayout = ({ img, title, description, numberInfo, bgColor, statusInfo, link }) => (
  <Link href={link || route("dashboard")} className="h-full">
    <div className="bg-white shadow-lg rounded-lg p-4 flex items-center gap-4 h-full">
      {/* Color Box */}
      <div className="color-box w-full h-full rounded-lg flex items-center justify-center min-w-12 max-h-24" style={{ backgroundColor: bgColor }}>
        <img src={img} alt={title} className="max-h-8" />
      </div>
      {/* Card Content */}
      <div className="cardContent">
        <h3 className="text-base mb-2 font-normal">{title}</h3>
        <div className="numBox">
          <p className="text-4xl font-semibold inline-block">{numberInfo}</p>
          <p className="text-gray-500 text-xs inline-block ms-2">{statusInfo}</p>
        </div>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
    </div>
  </Link>
);

const DashboardStateGrid = ({ statusCounts = {} }) => {
  const { auth } = usePage().props;
  const userRoles = auth?.user?.roles || [];
  const userall = auth?.user?.userall || 0;
  const Admincommission = auth.user.commission || 0;
  console.log(userall[0].pan_card, 'userall')
  console.log(Admincommission, 'Admincommission')

  let totalcommissionper = ((statusCounts.totalBetToday / 10) * (Admincommission / 10)).toFixed(2);
  totalcommissionper = parseFloat(totalcommissionper);

  let netpoints = (statusCounts.totalBetToday - statusCounts.totalWinToday - totalcommissionper).toFixed(2);
  netpoints = parseFloat(netpoints);


  // Define role-based dashboard cards
  const roleBasedCards = {

    "Super Admin": [

      {
        img: img2,
        title: "Today's Sale",
        description: "",
        numberInfo: statusCounts.totalBetToday || 0,
        bgColor: "#D2E0FF",
        statusInfo: "",
        // link: route("games.index"),
      },
      {
        img: img3,
        title: "Today's Claim",
        description: "",
        numberInfo: statusCounts.totalClaimToday || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },
      {
        img: img3,
        title: "Today's Wins",
        description: "",
        numberInfo: statusCounts.totalWinToday || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },

      {
        img: img3,
        title: "Today Commission",
        description: "",
        numberInfo: totalcommissionper || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },
      {
        img: img3,
        title: "Net Points",
        description: "",
        numberInfo: netpoints || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },
      {
        img: img3,
        title: "Balance",
        description: "",
        numberInfo: userall[0].pan_card || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },
      {
        img: img1,
        title: "Today added Games",
        description: "",
        numberInfo: statusCounts.gamestoday || 0,
        bgColor: "#E4FFD2",
        statusInfo: "",
        link: route("games.index"),
      },
      {
        img: img4,
        title: "Today Players",
        description: "",
        numberInfo: statusCounts.playersToday || 0,
        bgColor: "#FFEFEF",
        statusInfo: "",
        link: route("players.index"),
      },
      {
        img: img1,
        title: "Total Games",
        description: "",
        numberInfo: statusCounts.games || 0,
        bgColor: "#E4FFD2",
        statusInfo: "",
        link: route("games.index"),
      },
      {
        img: img2,
        title: "Total Bets",
        description: "",
        numberInfo: statusCounts.totalBet || 0,
        bgColor: "#D2E0FF",
        statusInfo: "",
        // link: route("games.index"),
      },
      {
        img: img3,
        title: "Total User Wins",
        description: "",
        numberInfo: statusCounts.totalWin || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },

      {
        img: img4,
        title: "All Players",
        description: "",
        numberInfo: statusCounts.normalUsers || 0,
        bgColor: "#FFEFEF",
        statusInfo: "",
        link: route("players.index"),
      },

    ],
    "Stockit": [

      {
        img: img2,
        title: "Today's Sale",
        description: "",
        numberInfo: statusCounts.totalSaleToday || 0,
        bgColor: "#D2E0FF",
        statusInfo: "",
        // link: route("games.index"),
      },
      {
        img: img3,
        title: "Today's Claim",
        description: "",
        numberInfo: statusCounts.totalClaimToday || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },
      {
        img: img3,
        title: "Today's Wins",
        description: "",
        numberInfo: statusCounts.totalWinToday || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },

      {
        img: img3,
        title: "Today Commission",
        description: "",
        numberInfo: totalcommissionper || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },

      {
        img: img4,
        title: "Today Players",
        description: "",
        numberInfo: statusCounts.playersToday || 0,
        bgColor: "#FFEFEF",
        statusInfo: "",
        link: route("players.index"),
      },
      {
        img: img3,
        title: "Net Points",
        description: "",
        numberInfo: netpoints || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },
      {
        img: img3,
        title: "Balance",
        description: "",
        numberInfo: userall[0].pan_card || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },
      {
        img: img1,
        title: "Today added Games",
        description: "",
        numberInfo: statusCounts.gamestoday || 0,
        bgColor: "#E4FFD2",
        statusInfo: "",
        link: route("games.index"),
      },
      {
        img: img1,
        title: "Total Games",
        description: "",
        numberInfo: statusCounts.games || 0,
        bgColor: "#E4FFD2",
        statusInfo: "",
        link: route("games.index"),
      },
      {
        img: img2,
        title: "Total Bets",
        description: "",
        numberInfo: statusCounts.totalBet || 0,
        bgColor: "#D2E0FF",
        statusInfo: "",
        // link: route("games.index"),
      },
      {
        img: img3,
        title: "Total User Wins",
        description: "",
        numberInfo: statusCounts.totalWin || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        // link: route("inventory.index"),
      },

      {
        img: img4,
        title: "All Players",
        description: "",
        numberInfo: statusCounts.normalUsers || 0,
        bgColor: "#FFEFEF",
        statusInfo: "",
        link: route("players.index"),
      },

    ],
    "Retailer": [

      {
        img: img2,
        title: "Today Sale points",
        description: "",
        numberInfo: statusCounts.totalBetToday || 0,
        bgColor: "#D2E0FF",
        statusInfo: "",
        link: route("retailer.playergameResults"),
      },
      {
        img: img3,
        title: "Today Win Points",
        description: "",
        numberInfo: statusCounts.totalWinToday || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        link: route("retailer.playergameResults"),
      },
      {
        img: img3,
        title: "Today Average Bet",
        description: "",
        numberInfo: (statusCounts.totalBetToday / statusCounts.normalUsers) || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        link: route("retailer.playerhistory"),
      },
      {
        img: img3,
        title: "Today Players",
        description: "",
        numberInfo: statusCounts.playersToday || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        link: route("players.index"),
      },
      {
        img: img3,
        title: "Today Claim",
        description: "",
        numberInfo: statusCounts.totalClaimToday || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        link: route("players.index"),
      },
      {
        img: img3,
        title: "Today Unclaim",
        description: "",
        numberInfo: statusCounts.todayUnclaim || 0,
        bgColor: "#D9D2FF",
        statusInfo: "",
        link: route("players.index"),
      },

      {
        img: img3,
        title: "View Players",
        description: "",
        numberInfo: '',
        bgColor: "#D9D2FF",
        statusInfo: "",
        link: route("retailer.playerhistory"),
      },
      {
        img: img3,
        title: "Turnover Report",
        description: "",
        numberInfo: '',
        bgColor: "#D9D2FF",
        statusInfo: "",
        link: route("retailer.turnoverHistory"),
      },
      // {
      //   img: img1,
      //   title: "Today added Games",
      //   description: "",
      //   numberInfo: statusCounts.gamestoday || 0,
      //   bgColor: "#E4FFD2",
      //   statusInfo: "",
      //   link: route("games.index"),
      // },

      // {
      //   img: img4,
      //   title: "Today Players",
      //   description: "",
      //   numberInfo: statusCounts.playersToday || 0,
      //   bgColor: "#FFEFEF",
      //   statusInfo: "",
      //   link: route("players.index"),
      // },
      // {
      //   img: img1,
      //   title: "Total Games",
      //   description: "",
      //   numberInfo: statusCounts.games || 0,
      //   bgColor: "#E4FFD2",
      //   statusInfo: "",
      //   link: route("games.index"),
      // },
      // {
      //   img: img2,
      //   title: "Total Bets",
      //   description: "",
      //   numberInfo: statusCounts.totalBet || 0,
      //   bgColor: "#D2E0FF",
      //   statusInfo: "",
      //   // link: route("games.index"),
      // },
      // {
      //   img: img3,
      //   title: "Total User Wins",
      //   description: "",
      //   numberInfo: statusCounts.totalWin || 0,
      //   bgColor: "#D9D2FF",
      //   statusInfo: "",
      //   // link: route("inventory.index"),
      // },

      // {
      //   img: img4,
      //   title: "All Players",
      //   description: "",
      //   numberInfo: statusCounts.normalUsers || 0,
      //   bgColor: "#FFEFEF",
      //   statusInfo: "",
      //   link: route("players.index"),
      // },

    ],

  };

  // Get cards for the first matching role
  const matchingRole = Object.keys(roleBasedCards).find((role) => userRoles.includes(role));
  const cardsToDisplay = roleBasedCards[matchingRole] || [];

  if (cardsToDisplay.length === 0) return null; // Hide the dashboard if no matching role

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cardsToDisplay.map((card, index) => (
        <CardLayout key={index} {...card} />
      ))}
    </div>
  );
};

export default DashboardStateGrid;