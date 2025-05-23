import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { exportFileIcon } from '../../../../utils/svgIconContent';

export default function Import({ message }) {
    const { data, setData, post, processing, errors } = useForm({
        csv_file: null,
    });
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        setData('csv_file', e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('plants.importfg-store'));
    };

    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <AuthenticatedLayout


            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Import Raw Materials
                </h2>
            }
        >
            <Head title="Import Raw Materials" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />  <Link href={route('raw-materials.index')}>Inventory Management</Link><FiChevronRight size={24} color="black" /> <span className='text-red'>Import Raw Materials</span></p>
                    <Link href={route('raw-materials.index')} className="border border-red py-1 px-14 text-red rounded max-w-max">Back</Link>
                </div>
                <div className="mx-auto py-6">
                    {errors && Object.keys(errors).length > 0 && (
                        <div className="error-messages bg-rose-50 border border-rose-100 text-red p-4 mb-4 rounded-lg">
                            {Object.values(errors).map((error, index) => (
                                <p key={index} className="text-errorRed text-sm">{error}</p>
                            ))}
                        </div>
                    )}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* <div className="p-10 text-gray-900 min-h-[80vh]">
                            <h2 className="text-3xl font-semibold text-center text-gray-700 mb-14">
                                Upload File
                            </h2>
                            <div className="flex justify-center items-center mb-4">
                                
                            </div>
                            <div className='text-center'>
                                <p className="text-md font-bold text-center text-black mb-6">
                                    File Column Should be Item Code, Item Description, HSN/SAC Code, Status, Unit, Plant
                                </p>

                                <p className='text-sm text-black'>Drag or Click to Upload, File Should be CSV</p>
                            </div>
                            {/* Buttons */}
                        {/* <div className="flex justify-between mt-10">
                                <form onSubmit={handleSubmit} encType="multipart/form-data" className='flex justify-between w-full'>
                                    <div className="mb-4"> */}
                        {/* <label className="block text-gray-700">Choose CSV File</label> */}
                        {/* <input
                                            type="file"
                                            name="csv_file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileChange}

                                            className="max-w-[70%] mt-1 border p-1 border-red rounded-md"
                                        />
                                        {errors.csv_file && <div className="text-errorRed text-sm">{errors.csv_file}</div>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-red rounded hover:bg-red-800 max-h-[40px]"
                                    >
                                        Import Raw Materials
                                    </button>
                                </form>
                                <button className="bg-white text-red-500 py-2 px-6 rounded border border-red-500 hover:bg-red-100">
                                    Reset
                                </button>
                            </div>

                        </div> */}

                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            <div className="items-center justify-center w-full mb-4">
                                <label
                                    htmlFor="dropzone-file"
                                    className="flex flex-col items-center justify-center w-full h-full p-7 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 gap-3 px-6">
                                        <h2 className="text-3xl font-semibold text-center text-gray-700 mb-14">
                                            Upload File
                                        </h2>
                                        {exportFileIcon}
                                        <p className="text-md font-bold text-center text-black mb-6">
                                            File Column Should be Item Code, Item Description, HSN/SAC Code, Status, Unit, Plant
                                        </p>
                                        <p className="text-sm text-black">Drag or Click to Upload, File Should be CSV, XLSX, or XLS</p>
                                    </div>
                                    <div className='relative'>
                                        <span className='bg-red text-white px-3 py-1 absolute'>Upload
                                            File</span>
                                        <input
                                            id="dropzone-file"
                                            type="file"
                                            name="csv_file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            className="border-none outline-none mt-[2px] ml-1"
                                        />

                                        {/* <input
                                            type="file"
                                            name="csv_file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileChange}

                                            className="max-w-[70%] mt-1 border p-1 border-red rounded-md"
                                        /> */}


                                    </div>

                                </label>
                                {/* {errors && errors.csv_file && <div className="mt-2 text-errorRed text-sm">{errors.csv_file}</div>} */}
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-between mt-10 flex-col items-start gap-2 sm:flex-row">
                                <form onSubmit={handleSubmit} encType="multipart/form-data" className='flex justify-between w-full'>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 font-bold text-white bg-red rounded hover:bg-red-800 max-h-[40px]"
                                    >
                                        Import Raw Materials
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetFileInput}
                                        className="px-8 py-2 border border-red text-red rounded hover:bg-red-100 transition duration-200 border-btn"
                                    >
                                        Reset File
                                    </button>
                                </form>
                                <div className="">
                                    <a
                                        href="/imports/plant_finished_good.csv"
                                        download
                                        className="inline-block min-w-52 px-4 py-2 border border-red text-red rounded hover:bg-red-100 transition duration-200 border-btn"
                                    >
                                        Download Sample File
                                    </a>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
