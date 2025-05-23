import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

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
                    ${Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
                .map(link => `<link rel="stylesheet" href="${link.href}" />`)
                .join('\n')}
                    <style>
                        @media print { .no-print { display: none !important; } }
                        @page { margin: 1cm; }
                        body { margin: 0; padding: 1cm; }
                    </style>
                </head>
                <body>
                    ${clone.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold">View Tickets for {user.name}</h2>}
        >
            <Head title="Your Tickets" />

            <div className="w-4/5 ml-auto pt-[15vh] flex flex-wrap justify-start gap-8">
                {tickets.length > 0 ? (
                    tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            id={`ticket-${ticket.id}`}
                            className="w-full max-w-md border rounded-lg shadow p-6 bg-white"
                        >
                            <h1 className="text-2xl font-bold mb-4">Lottery Ticket</h1>

                            <p className="mb-2">
                                <strong>Serial #:</strong>{' '}
                                <span className="font-mono">{ticket.serial_number}</span>
                            </p>

                            <p className="mb-2">
                                <strong>Amount:</strong>{' '}
                                ₹{Number(ticket.amount).toLocaleString()}
                            </p>

                            <p className="mb-4">
                                <strong>Card Name:</strong> {ticket.card_name}
                            </p>

                            <img
                                src={`${ticket.bar_code_scanner}`}
                                alt={`Barcode for ${ticket.serial_number}`}
                                className="mb-4"
                            />

                            <p className="mb-4">
                                <strong>Ticket Result:</strong> {getResultTimeFromCreatedAt(ticket.created_at)}
                            </p>

                            <button
                                onClick={() => printTicket(ticket.id)}
                                className="no-print px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Print Ticket
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No tickets found.</p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}