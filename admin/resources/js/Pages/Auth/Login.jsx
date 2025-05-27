import { useEffect, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        mobile: '',
        otp: '',
    });

    const [otpSent, setOtpSent] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        const storedError = sessionStorage.getItem("errorMessage");
        if (storedError) {
            setErrorMessage(storedError);
        }
    }, []);

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [resendTimer]);

    const sendOtp = async () => {
        setErrorMessage(null);
        sessionStorage.removeItem("errorMessage"); // Clear previous error

        try {
            const formattedMobile = `+91${data.mobile}`; // Ensure +91 is included

            const response = await axios.post(route('send.otp'), { mobile: formattedMobile });
            setOtpSent(true);
            setResendTimer(30); // Start 30-second timer
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to send OTP.";
            setErrorMessage(errorMsg);
            sessionStorage.setItem("errorMessage", errorMsg); // Store in session storage
        }
    };


    const submit = (e) => {
        e.preventDefault();
        setErrorMessage(null);
        post(route('verify.otp'), {
            onError: (err) => setErrorMessage(errorMessage),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}

            <div>
                <h3 className='text-sm uppercase'>Login To</h3>
                <p className='font-bold text-4xl mb-6'>Your Dashboard</p>
            </div>

            {errorMessage && <p className="text-errorRed text-sm">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

            <form onSubmit={submit}>
                {/* Mobile Number Input */}
                <div>
                    <InputLabel htmlFor="mobile" value="Mobile Number" />
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <span className="px-3 py-2 bg-gray-100 text-gray-600">+91</span>
                        <TextInput
                            id="mobile"
                            type="text"
                            name="mobile"
                            value={data.mobile}
                            className="mt-1 block w-full"
                            maxLength={10}
                            onChange={(e) => {
                                const inputValue = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
                                if (inputValue.length <= 10) {
                                    setData('mobile', inputValue);
                                }
                            }}
                        />
                    </div>
                    {errors.mobile && <div className="text-errorRed text-sm">{errors.mobile}</div>}
                </div>

                {/* OTP Input */}
                {otpSent && (
                    <div className="mt-4">
                        <InputLabel htmlFor="otp" value="Enter OTP" />
                        <TextInput
                            id="otp"
                            type="text"
                            name="otp"
                            value={data.otp}
                            className="mt-1 block w-full"
                            maxLength={6}
                            onChange={(e) => {
                                const inputValue = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
                                if (inputValue.length <= 6) {
                                    setData('otp', inputValue);
                                }
                            }}
                        />
                        {errors.otp && <div className="text-errorRed text-sm">{errors.otp}</div>}
                    </div>
                )}

                <div className="mt-4 text-right">
                    {!otpSent ? (
                        <PrimaryButton onClick={sendOtp} className="mt-2 w-full text-center justify-center bg-red rounded text-md hover:bg-red/85">
                            Send OTP
                        </PrimaryButton>
                    ) : (
                        <>
                            <PrimaryButton type="submit" className="mt-2 w-full text-center justify-center bg-red rounded text-md hover:bg-red/85">
                                Verify OTP
                            </PrimaryButton>

                            <div className="mt-4 text-center">
                                {resendTimer > 0 ? (
                                    <p className="text-gray-500">Resend OTP in {resendTimer} seconds</p>
                                ) : (
                                    <PrimaryButton onClick={sendOtp} className="mt-2">
                                        Resend OTP
                                    </PrimaryButton>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </form>
        </GuestLayout>
    );
}
