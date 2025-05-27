import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

// Custom searchable dropdown component with search input inside the options
function SearchableSelect({ options, value, onChange, className, placeholder = "Select Item Code" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const containerRef = useRef(null);

    const [notification, setNotification] = useState('');
    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    // Filter options based on filter text (case-insensitive)
    const filteredOptions = options.filter(option =>
        option.item_code.toLowerCase().includes(filter.toLowerCase())
    );

    const selectedOption = options.find(option => option.item_code === value);

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOptionClick = (option) => {
        onChange(option.item_code);
        setIsOpen(false);
        setFilter('');
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={toggleDropdown}
                className={`${className} cursor-pointer flex justify-between items-center`}
            >
                <span>{selectedOption ? selectedOption.item_code : placeholder}</span>
                <FiChevronRight className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1">
                    <input
                        type="text"
                        placeholder="Filter options..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full p-2 border-b border-gray-300 focus:outline-none"
                    />
                    <ul className="max-h-60 overflow-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <li
                                    key={option.id}
                                    onClick={() => handleOptionClick(option)}
                                    className="p-1 text-sm hover:bg-gray-100 cursor-pointer"
                                >
                                    {option.item_code}
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-gray-500">No options found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function Edit({ purchaseOrder, clients, plants, finishedGoods, orderedItems }) {
    const [currentScreen, setCurrentScreen] = useState(1); // 1 for form, 2 for preview
    const { data, setData, put, processing, errors } = useForm({
        po_number: purchaseOrder.po_number,
        client_id: purchaseOrder.client_id,
        plant_id: purchaseOrder.plant_id,
        order_status: purchaseOrder.order_status,
        po_date: purchaseOrder.po_date,
        expected_delivery_date: purchaseOrder.expected_delivery_date,
        file_url: purchaseOrder.file_url,
        ordered_items: orderedItems.map(item => ({
            id: item.id,
            item_code: item.item_code,
            hsn_sac_code: item.hsn_sac_code,
            quantity: item.quantity,
            unit: item.unit,
            item_description: item.item_description,
            rate_per_unit: item.rate_per_unit,
            gst_percentage: item.gst_percentage,
            total_price: item.total_price || '',
        })),
    });

    const [notification, setNotification] = useState('');
    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const [preview, setPreview] = useState(false);

    // Filter finished goods based on the selected plant_id
    const filteredFinishedGoods = data.plant_id
        ? finishedGoods.filter(fg => fg.plant_id === Number(data.plant_id))
        : [];

    // Update the ordered item when an item code is selected
    const handleItemCodeChange = (index, value) => {
        // Use item_code field for lookup
        const selectedMaterial = finishedGoods.find(material => material.item_code === value);
        if (selectedMaterial) {
            const updatedItems = data.ordered_items.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        item_code: selectedMaterial.item_code,
                        hsn_sac_code: selectedMaterial.hsn_sac_code || '',
                        item_description: selectedMaterial.item_description || '',
                        rate_per_unit: selectedMaterial.rate_per_unit || '',
                        gst_percentage: selectedMaterial.gst_percentage || '',
                        total_price: selectedMaterial.rate_per_unit * item.quantity || '',
                    }
                    : item
            );
            setData('ordered_items', updatedItems);
        }
    };

    const updateOrderedItem = (index, field, value) => {
        const updatedItems = data.ordered_items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setData('ordered_items', updatedItems);
    };

    const removeOrderedItem = (index) => {
        const updatedItems = [...data.ordered_items];
        updatedItems[index]._deleted = true;
        setData('ordered_items', updatedItems);
        showNotification("Removed FG Item");
    };

    const addNewOrderedItem = () => {
        setData('ordered_items', [
            ...data.ordered_items,
            {
                item_code: '',
                hsn_sac_code: '',
                quantity: '',
                unit: '',
                item_description: '',
                rate_per_unit: '',
                gst_percentage: '',
                total_price: '',
            },
        ]);
        showNotification("Added FG Item");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('client-purchase-orders.update', purchaseOrder.id), {
            onSuccess: () => setPreview(true), // Go to preview screen on success
            onError: () => setPreview(false),  // Stay on form screen if there are errors
        });
    };

    const handleBack = () => {
        setCurrentScreen(1); // Go back to form screen
    };

    return (
        <AuthenticatedLayout

            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Client Order</h2>}>
            <Head title="Edit Purchase Order" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className='flex'>
                        <Link href={route('dashboard')}>Dashboard</Link> <FiChevronRight size={24} color="black" /><Link href={route('client-purchase-orders.index')}>Client Purchase Orders</Link> <FiChevronRight size={24} color="black" />
                        <span className='text-red'>Edit Client Purchase Orders</span>
                    </p>
                    <Link href={route('client-purchase-orders.index')} className="border border-red py-1 px-14 text-red rounded max-w-max">
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 min-h-[80vh]">

                            {notification && (
                                <div className="mb-4 p-2 bg-green-100 text-green-700 border border-green-300 rounded">
                                    {notification}
                                </div>
                            )}
                            <form onSubmit={(e) => { e.preventDefault(); setPreview(true); }} className='styled-form'>
                                {!preview ? (
                                    <>
                                        <div className='mb-4'>
                                            <h3 className='font-semibold text-3xl mb-6'>Edit Client Purchase Order</h3></div>
                                        <div className='theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">PO Number*</label>
                                                <input
                                                    type="text"
                                                    value={data.po_number}
                                                    onChange={(e) => setData('po_number', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-gray-700">Client Name*</label>
                                                <select
                                                    value={data.client_id}
                                                    onChange={(e) => setData('client_id', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                >
                                                    <option value="">Select Client</option>
                                                    {players.map(client => (
                                                        <option key={client.id} value={client.id}>{client.company_name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-gray-700">Plant*</label>
                                                <select
                                                    value={data.plant_id}
                                                    onChange={(e) => setData('plant_id', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    disabled>
                                                    <option value="">Select Plant</option>
                                                    {plants.map(plant => (
                                                        <option key={plant.id} value={plant.id}>{plant.plant_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Order Status</label>


                                                <select
                                                    value={data.order_status}
                                                    onChange={(e) => setData('order_status', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                >
                                                    <option value="pending_for_approval">Pending</option>
                                                    <option value="ready_to_release">Release Initiated</option>
                                                    <option value="on_hold">On Hold</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                {errors.order_status && <div className="text-errorRed text-sm">{errors.order_status}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">PO Date*</label>
                                                <input type="date" value={data.po_date} onChange={(e) => setData('po_date', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                                                {errors.po_date && <div className="text-errorRed text-sm">{errors.po_date}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Expected Delivery Date</label>
                                                <input type="date" value={data.expected_delivery_date} onChange={(e) => setData('expected_delivery_date', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" />
                                                {errors.expected_delivery_date && <div className="text-errorRed text-sm">{errors.expected_delivery_date}</div>}
                                            </div>
                                            <div className="mb-4">

                                                <div className="mb-4">
                                                    <label className="block text-gray-700">Uploaded File</label>
                                                    {data.file_url ? (
                                                        <a href={typeof data.file_url === 'string' ? data.file_url : URL.createObjectURL(data.file_url)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 underline">
                                                            View File
                                                        </a>
                                                    ) : (
                                                        <input
                                                            type="file"
                                                            onChange={(e) => setData({ ...data, file_url: e.target.files[0] })}
                                                            className="w-full mt-1 border p-2 border-gray-300 rounded-md shadow-sm"
                                                        />
                                                    )}
                                                    {errors.file_url && <div className="text-errorRed text-sm">{errors.file_url}</div>}
                                                </div>


                                                {errors.file_url && <div className="text-errorRed text-sm">{errors.file_url}</div>}
                                            </div>
                                        </div>

                                        <h3 className='font-semibold text-2xl mb-4 mt-4'>Order Item Details</h3>

                                        {data.ordered_items.map((item, index) => (
                                            !item._deleted && (
                                                <div key={index} className="border p-4 mb-2 relative">
                                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                                                        <div>
                                                            <label className="block text-gray-700">Item Code*</label>
                                                            <SearchableSelect
                                                                options={filteredFinishedGoods}
                                                                value={item.item_code}
                                                                onChange={(val) => handleItemCodeChange(index, val)}
                                                                className="w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 text-gray-500 text-sm min-h-[41px]"
                                                                placeholder={data.plant_id ? "Select Item Code" : "Select Plant first"}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700">HSN/SAC CODE*</label>
                                                            <input
                                                                type="text"
                                                                placeholder="HSN/SAC Code"
                                                                value={item.hsn_sac_code}
                                                                readOnly
                                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm "
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700">Quantity*</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Quantity"
                                                                value={item.quantity}
                                                                onChange={(e) => updateOrderedItem(index, 'quantity', e.target.value)}
                                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                            />
                                                            {errors[`ordered_items.${index}.quantity`] && <div className="text-errorRed text-sm">{errors[`ordered_items.${index}.quantity`]}</div>}
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700">Unit*</label>
                                                            <select
                                                                value={item.unit}
                                                                onChange={(e) => updateOrderedItem(index, 'unit', e.target.value)}
                                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                            >
                                                                <option value="">Select Unit</option>

                                                                <option value="pieces">Pieces</option>
                                                            </select>

                                                            {errors[`ordered_items.${index}.unit`] && <div className="text-errorRed text-sm">{errors[`ordered_items.${index}.unit`]}</div>}
                                                        </div>

                                                    </div>
                                                    <div className='grid grid-cols-[1fr_auto] gap-6 items-end mt-4 align-bottom'>
                                                        <div>
                                                            <label className="block text-gray-700">Item Description*</label>
                                                            <input
                                                                placeholder="Item Description"
                                                                value={item.item_description}
                                                                readOnly
                                                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm bg-white"
                                                            />
                                                        </div>
                                                        <button type="button" onClick={() => removeOrderedItem(index)} className="bg-red-500 text-white px-2 py-1 rounded mt-2 min-h-10">Remove Item</button>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                        <div className='button-box flex gap-2'>
                                            <button type="button" onClick={addNewOrderedItem} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
                                                Add Ordered Item
                                            </button>


                                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Preview & Next </button>

                                        </div>
                                    </>
                                ) : (
                                    <div className='preview-section p-4 rounded'>
                                        <h3 className='font-semibold text-2xl mb-4'>Preview Client Purchase Order</h3>
                                        <div className='bg-lightGrayTheme p-6 mb-4'>
                                            <h3 className='font-semibold text-lg mb-4 text-black'>PO Details</h3>

                                            <div className='grid grid-cols-2 gap-2 '>
                                                <p><strong>PO Number:</strong> {data.po_number}</p>
                                                <p><strong>PO Date: </strong>
                                                    {data.po_date ? new Date(data.po_date)
                                                        .toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "2-digit",
                                                        })
                                                        .replace(/\s/g, "-")
                                                        : "N/A"}</p>
                                                <p><strong>Expected Delivery Date: </strong>
                                                    {data.expected_delivery_date
                                                        ? new Date(data.expected_delivery_date)
                                                            .toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "2-digit",
                                                            })
                                                            .replace(/\s/g, "-")
                                                        : "N/A"}</p>
                                                <p><strong>Uploaded File: </strong>{data.file_url ? (
                                                    <a href={typeof data.file_url === 'string' ? data.file_url : URL.createObjectURL(data.file_url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-red font-bold">
                                                        View
                                                    </a>
                                                ) : (
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setData({ ...data, file_url: e.target.files[0] })}
                                                        className="w-full mt-1 border p-2 border-gray-300 rounded-md shadow-sm"
                                                    />
                                                )}</p>
                                            </div>
                                        </div>

                                        <div className='bg-lightGrayTheme p-6 mb-4 grid grid-cols-2 gap-4 '>
                                            <div className='flex-col flex gap-2 align-top'>
                                                <h3 className='font-semibold text-lg mb-1 text-black'>Plant Details</h3>
                                                <p><strong>Plant: </strong>
                                                    {plants.length > 0 && data.plant_id
                                                        ? plants.find(plant => String(plant.id) === String(data.plant_id))?.plant_name || 'N/A'
                                                        : 'N/A'}
                                                </p>
                                                <p><strong>Address : </strong>  {plants.length > 0 && data.plant_id
                                                    ? plants.find(plant => String(plant.id) === String(data.plant_id))?.city || 'N/A'
                                                    : 'N/A'}<br></br>  {plants.length > 0 && data.plant_id
                                                        ? plants.find(plant => String(plant.id) === String(data.plant_id))?.address || 'N/A'
                                                        : 'N/A'} {plants.length > 0 && data.plant_id
                                                            ? plants.find(plant => String(plant.id) === String(data.plant_id))?.state || 'N/A'
                                                            : 'N/A'} {plants.length > 0 && data.plant_id
                                                                ? plants.find(plant => String(plant.id) === String(data.plant_id))?.zip || 'N/A'
                                                                : 'N/A'}</p>
                                            </div>
                                            <div className='grid gap-2'>
                                                <h3 className='font-semibold text-lg mb-1 text-black '>Client Details</h3>
                                                <p><strong>Name :</strong>    {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.company_name || 'N/A'
                                                    : 'N/A'}</p>
                                                <p><strong>GSTIN Number :</strong>  {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.gstin_number || 'N/A'
                                                    : 'N/A'}</p>
                                                <p><strong>Mobile No :  </strong>  {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.mobile_number || 'N/A'
                                                    : 'N/A'}</p>
                                                <p><strong>Pan No :  </strong>  {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.pan_card || 'N/A'
                                                    : 'N/A'}</p>
                                                <p><strong>Address : </strong> {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.name || 'N/A'
                                                    : 'N/A'}<br></br> {players.length > 0 && data.client_id
                                                        ? players.find(client => String(client.id) === String(data.client_id))?.company_address || 'N/A'
                                                        : 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className='bg-lightGrayTheme p-6 mb-4 gap-4 '>
                                            <h3 className='font-semibold text-lg mb-4 text-gray-600'>Items Details</h3>
                                            <div>  <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="text-left border-b">
                                                        <th className="p-2 font-semibold text-red">Item Code</th>
                                                        <th className="p-2 font-semibold text-red">HSN/SAC CODE</th>
                                                        <th className="p-2 font-semibold text-red">Item Description</th>
                                                        <th className="p-2 font-semibold text-red">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.ordered_items.map((item, index) => (
                                                        <tr key={index} className="">
                                                            <td className="p-2 font-bold">{item.item_code}</td>
                                                            <td className="p-2">{item.hsn_sac_code}</td>
                                                            <td className="p-2">{item.item_description}</td>
                                                            <td className="p-2">{item.quantity} {item.unit}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table></div>
                                        </div>
                                        <div className="mt-6">
                                            <button type="button" onClick={() => setPreview(false)} className="px-4 py-2 font-bold text-white bg-gray-500 rounded hover:bg-gray-700">
                                                Back To Edit PO
                                            </button>
                                            <button onClick={handleSubmit} disabled={processing} className="bg-red text-white px-4 py-2 rounded ml-4">Publish PO</button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
