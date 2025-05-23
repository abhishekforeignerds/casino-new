import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: 'pending_approval',
        mobile_number: '',
        role: 'Client',
        company_name: '',
        gstin_number: '',
        pan_card: '',
        state_code: '',
        company_address: '',
        plant_id: ''
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div>
                <h3 className='text-sm uppercase'>register to</h3>
                <p className='font-bold text-4xl mb-6'>Your Dashboard</p>
            </div>

            <form className='2-col-form grid grid-cols-2 gap-2' onSubmit={submit}>
                <div className="mt-4">
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    <div className="mt-4">
                        <label className="block text-gray-700">Registering as</label>

                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select </option>
                            <option value="Client">User</option>
                            <option value="Vendor">Vendor</option>
                        </select>
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700">Mobile Number</label>
                        <input
                            type="text"
                            value={data.mobile_number}
                            onChange={(e) => setData('mobile_number', e.target.value)}
                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Mobile Number'
                        />
                        {errors.mobile_number && <div className="text-errorRed text-sm">{errors.mobile_number}</div>}
                    </div>
                    <label className="block text-gray-700">Company Name</label>
                    <input
                        type="text"
                        value={data.company_name}
                        onChange={(e) => setData('company_name', e.target.value)}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Company Name'
                    />
                    {errors.company_name && <div className="text-errorRed text-sm">{errors.company_name}</div>}
                    <label className="block text-gray-700">GSTIN Number</label>
                    <input
                        type="text"
                        value={data.gstin_number}
                        onChange={(e) => setData('gstin_number', e.target.value)}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter GSTIN Number'
                    />
                    {errors.gstin_number && <div className="text-errorRed text-sm">{errors.gstin_number}</div>}
                    <label className="block text-gray-700">PAN Card</label>
                    <input
                        type="text"
                        value={data.pan_card}
                        onChange={(e) => setData('pan_card', e.target.value)}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter PAN Card'
                    />
                    {errors.pan_card && <div className="text-errorRed text-sm">{errors.pan_card}</div>}


                    <label className="block text-gray-700">State Code</label>
                    <input
                        type="text"
                        value={data.state_code}
                        onChange={(e) => setData('state_code', e.target.value)}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter State Code'
                    />
                    {errors.state_code && <div className="text-errorRed text-sm">{errors.state_code}</div>}


                    <label className="block text-gray-700">Company Address</label>
                    <textarea
                        value={data.company_address}
                        onChange={(e) => setData('company_address', e.target.value)}
                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm" placeholder='Enter Company Address'
                    ></textarea>
                    {errors.company_address && <div className="text-errorRed text-sm">{errors.company_address}</div>}


                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 text-right">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="mt-2 w-full text-center justify-center bg-red rounded text-md hover:bg-red/85" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
