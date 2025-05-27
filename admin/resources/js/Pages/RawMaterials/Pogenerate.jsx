import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

// Custom searchable dropdown component with the search input inside the options list
function SearchableSelect({ options, value, onChange, className, placeholder = "Select Item Code" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const containerRef = useRef(null);

    // Filter options based on the input text (case-insensitive)
    const filteredOptions = options.filter(option =>
        option.material_code.toLowerCase().includes(filter.toLowerCase())
    );
    const selectedOption = options.find(option => option.material_code === value);

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close dropdown when clicking outside
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
        onChange(option.material_code);
        setIsOpen(false);
        setFilter('');
    };

    return (
        <div className="relative" ref={containerRef}>
            <div onClick={toggleDropdown} className={`${className} cursor-pointer flex justify-between items-center`}>
                <span>{selectedOption ? selectedOption.material_code : placeholder}</span>
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
                                    {option.material_code}
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

export default function Create({ clients, plants, finishedGoods, materials = [] }) {
    // console.log(materials)
    // Initialize ordered_items based on the passed materials (which now include hsn_sac_code and material_name)
    const initialOrderedItems = materials.length > 0
        ? materials.map(mat => ({
            item_code: mat.material_code,
            hsn_sac_code: mat.hsn_sac_code,
            quantity: mat.material_quantity ?? 10, // default quantity
            unit: 'Kgs',     // default unit
            item_description: mat.material_name,
        }))
        : [{
            item_code: '',
            hsn_sac_code: '',
            quantity: '10',
            unit: 'Kgs',
            item_description: '',
        }];

    const { data, setData, post, processing, errors } = useForm({
        po_number: '',
        client_id: '',
        plant_id: '',
        order_status: '',
        po_date: '',
        expected_delivery_date: '',
        file_url: '',
        ordered_items: initialOrderedItems,
    });

    const { auth } = usePage().props;
    const user = auth.user;
    const [notification, setNotification] = useState('');
    const [preview, setPreview] = useState(false);

    // Clear notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const addOrderedItem = () => {
        setData('ordered_items', [
            ...data.ordered_items,
            { item_code: '', hsn_sac_code: '', quantity: '10', unit: 'Kgs', item_description: '' }
        ]);
    };

    const handleItemCodeChange = (index, value) => {
        const selectedMaterial = finishedGoods.find(material => material.material_code === value);
        if (selectedMaterial) {
            const updatedItems = data.ordered_items.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        item_code: selectedMaterial.material_code,
                        hsn_sac_code: selectedMaterial.hsn_sac_code || '',
                        item_description: selectedMaterial.material_name || ''
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
        const filteredItems = data.ordered_items.filter((_, i) => i !== index);
        setData('ordered_items', filteredItems);
        setNotification('Removed RM item');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vendor-purchase-orders.store'));
    };

    // Toggle to preview screen (you can add any validation before toggling if needed)
    const handlePreview = (e) => {
        e.preventDefault();
        setPreview(true);
    };

    // Return to form screen from preview
    const handleBack = () => {
        setPreview(false);
    };

    // The form view
    const formView = (
        <div className='mx-auto py-6'>
            <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />  <Link href={route('raw-materials.index')}>Inventory Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Low Stock Action</span></p>
                <Link
                    href={route('raw-materials.index')}  // Use the correct path to navigate to the users page
                    className="border border-red py-1 px-14 text-red rounded max-w-max"
                >
                    Back
                </Link>

            </div>
            <div className=' bg-white shadow-sm sm:rounded-lg p-6 text-gray-900'>
                <div className="top-search-bar-box flex py-4">
                    <h2 className="font-semibold text-2xl mb-6">Create Vendor Purchase Order</h2>
                </div>
                <form onSubmit={handlePreview} className="space-y-4 styled-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-700">PO Number*</label>
                            <input
                                type="text"
                                value={data.po_number}
                                onChange={(e) => setData('po_number', e.target.value)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Enter PO Number"
                            />
                            {errors.po_number && <div className="text-errorRed text-sm">{errors.po_number}</div>}
                        </div>
                        <div>
                            <label className="block text-gray-700">Vendor Name*</label>
                            <select
                                value={data.client_id}
                                onChange={(e) => setData('client_id', e.target.value)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="">Select Vendor</option>
                                {players.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700">Plant*</label>
                            <select
                                value={data.plant_id}
                                onChange={(e) => setData('plant_id', e.target.value)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                                disabled={data.plant_id && data.ordered_items.some(item => item.item_code !== '')}
                            >
                                <option value="">Select Plant</option>
                                {plants.map(plant => (
                                    <option key={plant.id} value={plant.id}>
                                        {plant.plant_name}
                                    </option>
                                ))}
                            </select>
                            {errors.plant_id && <div className="text-errorRed text-sm">{errors.plant_id}</div>}
                        </div>
                        <div>
                            <label className="block text-gray-700">Order Status</label>
                            <select
                                value={data.order_status}
                                onChange={(e) => setData('order_status', e.target.value)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="">Select Status</option>
                                {(user.roles[0] === 'Store Manager' || user.roles[0] === 'Super Admin') && (
                                    <option value="pr_requsted">PR Requested</option>
                                )}
                            </select>
                            {errors.order_status && <div className="text-errorRed text-sm">{errors.order_status}</div>}
                        </div>
                        <div>
                            <label className="block text-gray-700">PO Date*</label>
                            <input
                                type="date"
                                value={data.po_date}
                                onChange={(e) => setData('po_date', e.target.value)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.po_date && <div className="text-errorRed text-sm">{errors.po_date}</div>}
                        </div>
                        <div>
                            <label className="block text-gray-700">Expected Delivery Date</label>
                            <input
                                type="date"
                                value={data.expected_delivery_date}
                                onChange={(e) => setData('expected_delivery_date', e.target.value)}
                                className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.expected_delivery_date && <div className="text-errorRed text-sm">{errors.expected_delivery_date}</div>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-gray-700">Upload File</label>
                            {data.file_url ? (
                                <div className="flex items-center justify-between border p-1 mt-1 border-gray-300 rounded-md shadow-sm">
                                    <span>{data.file_url.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setData('file_url', '')}
                                        className="text-red-500 uplaod-r-btn p-1 rounded-md text-sm text-white"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.type !== 'application/pdf') {
                                            alert('Only PDF files are allowed.');
                                            return;
                                        }
                                        setData('file_url', file);
                                    }}
                                    className="flex items-center justify-between border p-1 mt-1 border-gray-300 rounded-md shadow-sm"
                                />
                            )}
                            {errors.file_url && <div className="text-errorRed text-sm">{errors.file_url}</div>}
                        </div>
                    </div>

                    <h3 className="font-semibold text-2xl mt-6">Order Item Details</h3>
                    {data.ordered_items.map((item, index) => (
                        <div key={index} className="border p-4 mb-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-gray-700">Item Code</label>
                                    <SearchableSelect
                                        options={finishedGoods}
                                        value={item.item_code}
                                        onChange={(val) => handleItemCodeChange(index, val)}
                                        className="w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 text-gray-500 text-sm min-h-[41px] cursor-pointer flex justify-between items-center"
                                        placeholder="Select Item Code"
                                    />
                                    {errors[`ordered_items.${index}.item_code`] && (
                                        <div className="text-errorRed text-sm">{errors[`ordered_items.${index}.item_code`]}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-gray-700">HSN/SAC CODE*</label>
                                    <input
                                        type="text"
                                        placeholder="HSN/SAC Code"
                                        value={item.hsn_sac_code}
                                        readOnly
                                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Quantity*</label>
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const updated = data.ordered_items.map((itm, i) =>
                                                i === index ? { ...itm, quantity: e.target.value } : itm
                                            );
                                            setData('ordered_items', updated);
                                        }}
                                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Unit*</label>
                                    <select
                                        value={item.unit}
                                        onChange={(e) => {
                                            const updated = data.ordered_items.map((itm, i) =>
                                                i === index ? { ...itm, unit: e.target.value } : itm
                                            );
                                            setData('ordered_items', updated);
                                        }}
                                        className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                                    >
                                        <option value="Kgs">Kgs</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-gray-700">Item Description*</label>
                                <input
                                    type="text"
                                    placeholder="Item Description"
                                    value={item.item_description}
                                    readOnly
                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={addOrderedItem}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Add Item
                        </button>
                        <button type="submit" className="bg-white text-red px-4 py-2 rounded mt-4 border-btn">
                            Preview & Next
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // The preview view
    const previewView = (
        <div className='mx-auto py-6'>
            <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                <p className='flex'><Link href={route('dashboard')}>Dashboard</Link>  <FiChevronRight size={24} color="black" />  <Link href={route('raw-materials.index')}>Inventory Management</Link>  <FiChevronRight size={24} color="black" /> <span className='text-red'>Low Stock Action</span></p>
                <Link
                    href={route('raw-materials.index')}  // Use the correct path to navigate to the users page
                    className="border border-red py-1 px-14 text-red rounded max-w-max"
                >
                    Back
                </Link>

            </div>
            <div className='bg-white shadow-sm sm:rounded-lg p-6 text-gray-900'>
                <h3 className="font-semibold text-2xl mb-4">Preview Vendor Purchase Order</h3>
                <div className="bg-lightGrayTheme p-6 mb-4">
                    <p><strong>PO Number:</strong> {data.po_number || 'N/A'}</p>
                    <p>
                        <strong>PO Date:</strong> {data.po_date ? new Date(data.po_date).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                    <p>
                        <strong>Expected Delivery Date:</strong> {data.expected_delivery_date ? new Date(data.expected_delivery_date).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                    <p>
                        <strong>Vendor:</strong> {players.find(client => String(client.id) === String(data.client_id))?.name || 'N/A'}
                    </p>
                    <p>
                        <strong>Plant:</strong> {plants.find(plant => String(plant.id) === String(data.plant_id))?.plant_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Uploaded File:</strong> {data.file_url ? data.file_url.name : 'N/A'}
                    </p>
                </div>

                <div className="bg-lightGrayTheme p-6 mb-4">
                    <h4 className="font-semibold text-lg mb-2">Order Items</h4>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2 text-left">Item Code</th>
                                <th className="p-2 text-left">HSN/SAC</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 text-left">Unit</th>
                                <th className="p-2 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.ordered_items.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2">{item.item_code || '-'}</td>
                                    <td className="p-2">{item.hsn_sac_code || '-'}</td>
                                    <td className="p-2">{item.quantity || '-'}</td>
                                    <td className="p-2">{item.unit || '-'}</td>
                                    <td className="p-2">{item.item_description || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-4 mt-6">
                    <button onClick={handleBack} className="bg-white border border-red text-red px-4 py-2 rounded">
                        Back To Create PO
                    </button>
                    <button onClick={handleSubmit} disabled={processing} className="bg-red text-white px-4 py-2 rounded">
                        Publish PO
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Purchase Order</h2>}>
            <Head title="Create Purchase Order" />
            <div className="main-content-container sm:ml-52 p-4">
                {preview ? previewView : formView}
            </div>
        </AuthenticatedLayout>
    );
}
