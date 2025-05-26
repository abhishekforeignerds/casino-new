import React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import img1 from "../../../../../assets-normal/img/goldens-k-sm.png";
import img2 from "../../../../../assets-normal/img/golden-q-sm.png";
import img3 from "../../../../../assets-normal/img/golden-j-sm.png";
import img4 from "../../../../../assets-normal/img/spades-golden-sm.png";
import img5 from "../../../../../assets-normal/img/golden-diamond-sm.png";
import img6 from "../../../../../assets-normal/img/clubs-golden-sm.png";
import img7 from "../../../../../assets-normal/img/golden-hearts-sm.png";

export default function ViewTickets({ tickets, user }) {

    const getResultTimeFromCreatedAt = (createdAt) => {
        const date = new Date(createdAt);
        const minutes = date.getMinutes();
        const offset = minutes % 2 === 1 ? 3 : 2;
        date.setMinutes(minutes + offset);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${mins}`;
    };

    const printTicket = (ticketId) => {
        const element = document.getElementById(`ticket-${ticketId}`);
        if (!element) return;

        const clone = element.cloneNode(true);
        clone.querySelectorAll('.no-print').forEach(node => node.remove());

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
      <html>
        <head>
          <title>Print Ticket</title>
          <base href="${window.location.origin}" />
          ${Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
                .map(link => `<link rel="stylesheet" href="${link.href}" />`)
                .join('\n')}
          <style>
            @media print {
              .no-print { display: none !important; }
              .print-table { display: table !important; }
              .print-table td img { width: 50px !important; height: 50px !important; }
            }
            @page { margin: 1cm; }
            body { margin: 0; padding: 1cm; }
          </style>
        </head>
        <body>
          ${clone.outerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    const cardImages = [
        { rank: img1, suit: img4, alt: 'King of Spades' },
        { rank: img1, suit: img5, alt: 'King of Diamonds' },
        { rank: img1, suit: img6, alt: 'King of Clubs' },
        { rank: img1, suit: img7, alt: 'King of Hearts' },
        { rank: img2, suit: img4, alt: 'Queen of Spades' },
        { rank: img2, suit: img5, alt: 'Queen of Diamonds' },
        { rank: img2, suit: img6, alt: 'Queen of Clubs' },
        { rank: img2, suit: img7, alt: 'Queen of Hearts' },
        { rank: img3, suit: img4, alt: 'Jack of Spades' },
        { rank: img3, suit: img5, alt: 'Jack of Diamonds' },
        { rank: img3, suit: img6, alt: 'Jack of Clubs' },
        { rank: img3, suit: img7, alt: 'Jack of Hearts' },
    ];
    const currentPath = window.location.pathname;
    const refreshLinkRef = useRef(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (refreshLinkRef.current) {
                refreshLinkRef.current.click();
            }
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(intervalId);
    }, []);
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold">View Tickets for {user.name}</h2>}>
            <Head title="Your Tickets" />

            <div className="w-4/5 ml-auto pt-[15vh]">
                <Link hidden ref={refreshLinkRef} href={currentPath}>
                    Refresh
                </Link>

                {tickets.length > 0 ? (
                    <div className="grid grid-cols-5 gap-4">
                        {[...tickets].reverse().map((ticket) => (
                            <div
                                key={ticket.id}
                                id={`ticket-${ticket.id}`}
                                className="border rounded-lg shadow p-4 bg-white flex flex-col"
                            >
                                <h1 className="text-base font-bold mb-2">Poker Roulette</h1>

                                <p className="mb-1 text-sm">
                                    <strong>Date & Time:</strong> {ticket.created_at_formatted}
                                </p>
                                <p className="mb-1 text-sm">
                                    <strong>Serial #:</strong>{' '}
                                    <span className="font-mono">{ticket.serial_number}</span>
                                </p>
                                <p className="mb-1 text-sm">
                                    <strong>Total Play:</strong> ₹{Number(ticket.amount).toLocaleString()}
                                </p>

                                {/* Print-only table */}
                                <table className="print:hidden w-full border-collapse border text-xs mb-2">
                                    <tbody>
                                        {Array.from({ length: 3 }, (_, row) => (
                                            <tr key={row}>
                                                {Array.from({ length: 4 }, (_, col) => {
                                                    const index = row * 4 + col;
                                                    const data = JSON.parse(ticket.card_name || '{}');
                                                    const amount = data[index] || 0;
                                                    const { rank, suit, alt } = cardImages[index];
                                                    return (
                                                        <td key={col} className="border p-1 text-center align-middle">
                                                            <div className="flex justify-center mb-1">
                                                                <img src={rank} alt={alt} className="h-5 w-auto" />
                                                                <img src={suit} alt={alt} className="h-5 w-auto" />
                                                            </div>
                                                            <div className="text-xs">₹{amount}</div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <img
                                    src={ticket.bar_code_scanner}
                                    alt={`Barcode for ${ticket.serial_number}`}
                                    className="mb-2 w-full h-auto object-contain"
                                />

                                <button
                                    onClick={() => printTicket(ticket.id)}
                                    className="no-print mt-auto text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Print Ticket
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No tickets found.</p>
                )}
            </div>

        </AuthenticatedLayout>
    );
}
