import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import imgk from "../../../assets/goldens-k.png";
import imgq from "../../../assets/golden-q.png";
import imgj from "../../../assets/golden-j.png";

export default function Ticket({ user }) {
    const coins = [5, 10, 20, 50, 100, 200, 500];
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [ticket, setTicket] = useState(null);
    const [lastTicket, setLastTicket] = useState(null);

    const getCardName = (index) => {
        const suits = ['Spades', 'Diamonds', 'Clubs', 'Hearts'];
        const ranks = ['K', 'Q', 'J'];
        const row = Math.floor(index / 4);
        const col = index % 4;
        return `${ranks[row]} of ${suits[col]}`;
    };

    const handleCardClick = (idx) => {
        if (!selectedCoin) return;
        const newTicket = { cardIndex: idx, amount: selectedCoin };
        setTicket(newTicket);
        setLastTicket(newTicket);
    };

    const { data, setData, put, reset } = useForm({
        serial_number: Math.floor(Math.random() * 1e9).toString(),
        bar_code_scanner: 'default_barcode',
        amount: 0,
        card_name: '',
        retailer_id: 1,
    });

    // Whenever ticket changes, immediately sync form data
    useEffect(() => {
        if (ticket) {
            setData({
                amount: ticket.amount,
                card_name: getCardName(ticket.cardIndex),
            });
        }
    }, [ticket]);

    const handleCreate = (e) => {
        e.preventDefault();
        if (!ticket) return;
        put(route('players.storeticket', user.id), {
            onSuccess: () => {
                reset('amount', 'card_name');
                setTicket(null);
                setSelectedCoin(null);
            },
        });
    };

    const handleClear = () => setTicket(null);
    const handleDouble = () => ticket && setTicket(t => ({ ...t, amount: t.amount * 2 }));
    const handleRepeat = () => lastTicket && setTicket({ ...lastTicket });

    const Coin = ({ amount, isSelected }) => {
        const bgMap = {
            5: 'from-gray-800 to-gray-600',
            10: 'from-green-800 to-green-600',
            20: 'from-blue-800 to-blue-600',
            50: 'from-indigo-800 to-indigo-600',
            100: 'from-red-800 to-red-600',
            200: 'from-purple-800 to-purple-600',
            500: 'from-pink-800 to-pink-600',
        };
        const bg = bgMap[amount] || 'from-gray-800 to-gray-600';
        const borderClasses = isSelected
            ? 'border-4 border-blue-500'
            : 'border-2 border-dotted border-white';

        return (
            <div
                className={`
          w-12 h-12 rounded-full
          bg-gradient-to-br ${bg}
          ${borderClasses}
          flex items-center justify-center
          text-sm font-bold
        `}
            >
                {amount}
            </div>
        );
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold">Create Ticket</h2>}>
            <Head title="Ticket" />

            <div className="w-4/5 mx-auto pt-[15vh] flex flex-col items-center gap-8">
                {/* CARD GRID */}
                <div
                    id="card-grid"
                    className="
                        h-[60vh] w-[60vw] ml-auto
                        grid grid-cols-5 grid-rows-4
                        divide-x divide-y divide-gray-400
                        rounded-lg shadow-2xl
                        bg-gradient-to-tr from-purple-100 to-purple-300
                        overflow-hidden
                    "
                >
                    <div className="empty" data-index="12" />
                    {[
                        { sym: '♠', css: 'text-black' },
                        { sym: '♦', css: 'text-red-600' },
                        { sym: '♣', css: 'text-black' },
                        { sym: '♥', css: 'text-red-600' },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center justify-center text-4xl p-2" data-index={13 + i}>
                            <span className={s.css}>{s.sym}</span>
                        </div>
                    ))}

                    {[
                        { label: imgk, codes: ['KS', 'KD', 'KC', 'KH'], baseIdx: 17 },
                        { label: imgq, codes: ['QS', 'QD', 'QC', 'QH'], baseIdx: 21 },
                        { label: imgj, codes: ['JS', 'JD', 'JC', 'JH'], baseIdx: 25 },
                    ].map(({ label, codes, baseIdx }, row) => (
                        <React.Fragment key={row}>
                            <div className="flex items-center justify-center p-2" data-index={baseIdx}>
                                <img className="w-12 h-auto" src={label} alt="label" />
                            </div>
                            {codes.map((code, i) => {
                                const idx = row * 4 + i;
                                return (
                                    <div
                                        key={idx}
                                        className="relative flex items-center justify-center p-2 cursor-pointer hover:bg-purple-200"
                                        onClick={() => handleCardClick(idx)}
                                        data-index={idx}
                                    >
                                        <img
                                            className="w-12 h-auto"
                                            src={`https://deckofcardsapi.com/static/img/${code}.png`}
                                            alt={code}
                                        />
                                        {ticket?.cardIndex === idx && (
                                            <div className="absolute">
                                                <Coin amount={ticket.amount} isSelected />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>

                {/* CONTROLS */}
                <div className="h-[30vh] w-full flex flex-col items-center justify-center gap-6">
                    <div className="flex flex-wrap justify-center gap-4">
                        {coins.map(c => (
                            <div key={c} onClick={() => setSelectedCoin(c)}>
                                <Coin amount={c} isSelected={selectedCoin === c} />
                            </div>
                        ))}
                    </div>

                    {ticket && (
                        <div className="flex flex-wrap justify-center gap-4">
                            <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                Create Ticket
                            </button>
                            <button onClick={handleClear} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                Clear
                            </button>
                            <button onClick={handleDouble} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Double
                            </button>
                            <button onClick={handleRepeat} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                                Repeat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
