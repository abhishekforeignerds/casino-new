import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';

export default function Edit({ game, message }) {
    const { data, setData, put, processing, errors } = useForm({
        game_spin_time: game.game_spin_time || '',
        min_bet: game.min_bet || '',
        maximum_bet: game.maximum_bet || '',
        game_name: game.game_name || '',
        game_type: game.game_type || '',
        game_category: game.game_category || '',
        winning_percentage: game.winning_percentage || '',
        override_chance: game.override_chance || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('games.update', game.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Game</h2>}
        >
            <Head title="Edit Finished Good" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex flex-wrap'>
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('games.index')}>Games Management</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className='text-red'>Edit Game</span>
                    </p>
                    <Link
                        href={route('games.index')}
                        className="border border-red py-1 px-14 text-red rounded max-w-max"
                    >
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="mb-6 text-2xl font-bold text-gray-800">Edit Game</h1>

                            {message && <div className="mb-4 text-green-600">{message}</div>}

                            <form onSubmit={handleSubmit} className="styled-form">
                                <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Game Spin Duration*', key: 'game_spin_time', placeholder: 'Game Spin Duration' },
                                        { label: 'Min Bet*', key: 'min_bet', placeholder: 'Minimum Bet' },
                                        { label: 'Max Bet*', key: 'maximum_bet', placeholder: 'Maximum Bet', type: 'number' },
                                        { label: 'Game Name*', key: 'game_name', placeholder: 'Game Name' },
                                        { label: 'Game Type*', key: 'game_type', placeholder: 'Game Type' },
                                        { label: 'Game Category*', key: 'game_category', placeholder: 'Game Category' },
                                        { label: 'Winning Percentage*', key: 'winning_percentage', placeholder: 'Winning Percentage' },
                                        { label: 'Override Chance*', key: 'override_chance', placeholder: 'Override Chance' },
                                    ].map(({ label, key, placeholder, type = 'text' }) => (
                                        <div className="mb-4" key={key}>
                                            <label className="block text-gray-700">{label}</label>
                                            <input
                                                type={type}
                                                value={data[key]}
                                                onChange={(e) => setData(key, e.target.value)}
                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                placeholder={placeholder}
                                            />
                                            {errors[key] && <div className="text-errorRed text-sm">{errors[key]}</div>}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800"
                                    >
                                        Update Game
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
