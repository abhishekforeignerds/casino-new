import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import img2 from "../../assets/welcome-vactor-bottom.png";
import img1 from "../../assets/welcome-vactor-top.png";
import img3 from "../../assets/Casino.jpeg";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50 flex">
                <div className="relative flex flex-1 min-h-screen flex-col items-center justify-start selection:bg-red-400 selection:text-white">
                    <div className="flex flex-1 z-10 relative min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0"
                        style={{ backgroundColor: ' rgb(158 123 65)' }}>
                        <header className="grid items-center justify-center mt-20">
                            <div className="flex lg:col-start-1 lg:justify-center">
                                <ApplicationLogo />
                            </div>
                            <nav className="flex flex-1 justify-center mt-10 gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-red rounded-md px-3 py-2 text-white ring-1 ring-transparent transition hover:bg-red/85 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="bg-red rounded-md px-3 py-2 text-white ring-1 ring-transparent transition hover:bg-red/85 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                        >
                                            Log in
                                        </Link>

                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-6">
                            <div className="grid gap-6 lg:grid-cols-1 lg:gap-8">
                                <div className="text-center rounded-sm  p-2 shadow-default dark:border-strokedark dark:bg-boxdark max-w-screen-md mr-auto ml-auto" >
                                    <h4 className="mb-3 text-6xl py-5 border-b-4 border-t-4 uppercase border-red font-semibold tracking-tight max-w-max mx-auto text-black">Welcome</h4>
                                    <p className="leading-normal text-black text-3xl lg:max-w-[80%] mx-auto">Your all-in-one solution for complete management needs!
                                    </p>

                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                <div
                    className='img-box-wel max-w-[30%] hidden md:block lg:max-w-[45%] flex-1 bg-vector-top-bottom relative'
                    style={{
                        backgroundImage: `url(${img3})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >   {/* <img src={img1} alt="" className='absolute w-full top-0 max-w-80 -left-20' /> */}
                    <div className='text-white w-[80%] mx-auto translate-y-60 relative z-10'>
                        <div className='p-2 border border-white border-t-2 max-w-max'>
                            <p className='text-sm uppercase font-light'>Welcome To</p>
                            <h3 className='font-bold text-4xl mt-1'>Casinous</h3>
                        </div>
                        <p className=' font-light mt-4 text-md'></p>

                    </div>
                    {/* <img src={img2} alt="" className='absolute w-full bottom-0 max-w-80 right-0' /> */}
                </div>
            </div>
        </>
    );
}
