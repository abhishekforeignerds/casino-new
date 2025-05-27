import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import img2 from "../../assets/welcome-vactor-bottom.png";
import img1 from "../../assets/welcome-vactor-top.png";
import img3 from "../../assets/Casino.jpeg";

export default function GuestLayout({ children }) {
    return (
        <div className='flex'>

            <div className="flex flex-1 z-10 relative min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0"
                style={{ backgroundColor: ' rgb(158 123 65)' }}>
                <div>
                    <Link href="/">
                        <ApplicationLogo className="h-20 fill-current text-gray-500 w-full" />
                    </Link>
                </div>

                <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                    {children}
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
            >
                {/* <img src={img1} alt="" className='absolute w-full top-0 max-w-80 -left-20' /> */}
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
    );
}
