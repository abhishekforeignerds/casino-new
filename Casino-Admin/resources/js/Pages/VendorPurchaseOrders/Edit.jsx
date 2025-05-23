import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FiChevronRight } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

// Custom searchable dropdown component (same as in Create)
function SearchableSelect({ options, value, onChange, className, placeholder = "Select Item Code" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const containerRef = useRef(null);

    const filteredOptions = options.filter(option =>
        option.material_code.toLowerCase().includes(filter.toLowerCase())
    );
    const selectedOption = options.find(option => option.material_code === value);
    const toggleDropdown = () => setIsOpen(!isOpen);

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
                            <li className="p-2 text-gray-500">Select Vendor First</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function Edit({ purchaseOrder, clients, plants, finishedGoods, orderedItems }) {
    // currentScreen: 1 for form, 2 for preview
    const [currentScreen, setCurrentScreen] = useState(1);
    const { data, setData, put, processing, errors } = useForm({
        po_number: purchaseOrder.po_number || '',
        client_id: purchaseOrder.client_id || '',
        plant_id: purchaseOrder.plant_id || '',
        order_status: purchaseOrder.order_status || '',
        po_date: purchaseOrder.po_date || '',
        expected_delivery_date: purchaseOrder.expected_delivery_date || '',
        file_url: purchaseOrder.file_url || '',
        ordered_items: orderedItems.length > 0 ? orderedItems.map(item => ({
            item_code: item.item_code || '',
            hsn_sac_code: item.hsn_sac_code || '',
            quantity: item.quantity || '',
            unit: item.unit || 'Kgs',
            item_description: item.item_description || '',
        })) : [
            { item_code: '', hsn_sac_code: '', quantity: '', unit: 'Kgs', item_description: '' }
        ],
    });
    const { auth } = usePage().props;
    const user = auth.user;
    const userRoles = auth?.user?.roles || [];
    const [notification, setNotification] = useState('');
    const [vendorMaterials, setVendorMaterials] = useState([]); // selected vendor's raw materials

    // Clear notification after 3 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Update vendorMaterials when vendor selection changes
    useEffect(() => {
        if (data.client_id) {
            const vendor = players.find(client => String(client.id) === String(data.client_id));
            if (vendor && vendor.vendor_materials) {
                setVendorMaterials(vendor.vendor_materials);
            } else {
                setVendorMaterials([]);
            }
        } else {
            setVendorMaterials([]);
        }
    }, [data.client_id, clients]);

    const addNewOrderedItem = () => {
        setData('ordered_items', [
            ...data.ordered_items,
            { item_code: '', hsn_sac_code: '', quantity: '', unit: 'Kgs', item_description: '' }
        ]);
        setNotification('Added RM item');
    };

    // When an item code is selected, prefill its quantity with vendor's minimum quantity
    const handleItemCodeChange = (index, value) => {
        const selectedMaterial = vendorMaterials.find(material => material.material_code === value);
        if (selectedMaterial) {
            const updatedItems = data.ordered_items.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        item_code: selectedMaterial.material_code,
                        hsn_sac_code: selectedMaterial.hsn_sac_code || '',
                        quantity: selectedMaterial.material_quantity || '',
                        item_description: selectedMaterial.material_name || ''
                    }
                    : item
            );
            setData('ordered_items', updatedItems);
        }
    };

    // Update ordered item fields; for quantity, enforce minimum and multiples of vendor's min quantity
    const updateOrderedItem = (index, field, value) => {
        const updatedItems = data.ordered_items.map((item, i) => {
            if (i === index) {
                let updatedValue = value;
                if (field === 'quantity') {
                    const selectedMaterial = vendorMaterials.find(mat => mat.material_code === item.item_code);
                    if (selectedMaterial) {
                        const minQuantity = Number(selectedMaterial.material_quantity) || 1;
                        let num = Number(value);
                        if (num < minQuantity) {
                            num = minQuantity;
                        }
                        if (num % minQuantity !== 0) {
                            num = Math.round(num / minQuantity) * minQuantity;
                        }
                        updatedValue = num;
                    }
                }
                return { ...item, [field]: updatedValue };
            }
            return item;
        });
        setData('ordered_items', updatedItems);
    };

    const removeOrderedItem = (index) => {
        const filteredItems = data.ordered_items.filter((_, i) => i !== index);
        setData('ordered_items', filteredItems);
        setNotification('Removed RM item');
    };

    // Toggle screens
    const handleNext = () => {
        setCurrentScreen(2);
    };

    const handleBack = () => {
        setCurrentScreen(1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Optionally, filter out deleted items if needed before submitting.
        put(route('vendor-purchase-orders.update', purchaseOrder.id), {
            onSuccess: () => {
                // Optionally navigate or show a success message
            },
            onError: () => setCurrentScreen(1),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Purchase Order</h2>}>
            <Head title="Edit Purchase Order" />
            <div className="main-content-container sm:ml-52">
                <div className="mx-auto py-6 flex justify-between flex-col md:flex-row gap-2">
                    <p className="flex">
                        <Link href={route('dashboard')}>Dashboard</Link>
                        <FiChevronRight size={24} color="black" />
                        <Link href={route('vendor-purchase-orders.index')}>Vendor Purchase Orders</Link>
                        <FiChevronRight size={24} color="black" />
                        <span className="text-red">Edit Vendor Order</span>
                    </p>
                    <Link href={route('vendor-purchase-orders.index')} className="border border-red py-1 px-14 text-red rounded max-w-max">
                        Back
                    </Link>
                </div>
                <div className="mx-auto py-6">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 min-h-[80vh]">
                            {notification && (
                                <div className="mb-4 p-4 bg-lightShadeGreen text-darkShadeGreen font-bold border border-green-200 rounded">
                                    {notification}
                                </div>
                            )}
                            {currentScreen === 1 ? (
                                <>
                                    <div className="top-search-bar-box flex py-4">
                                        <h2 className="font-semibold text-2xl mb-6">Edit Vendor Purchase Order</h2>
                                    </div>
                                    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="styled-form">
                                        <div className="theme-style-form grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                                            <div className="mb-4">
                                                <label className="block text-gray-700">PO Number*</label>
                                                <input
                                                    type="text"
                                                    value={data.po_number}
                                                    onChange={(e) => setData('po_number', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    placeholder="Enter PO Number"
                                                />
                                                {errors.po_number && <div className="text-errorRed text-sm">{errors.po_number}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Vendor Name*</label>
                                                <select
                                                    value={data.client_id}
                                                    onChange={(e) => setData('client_id', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                >
                                                    <option value="">Select Vendor</option>
                                                    {players.map((client) => (
                                                        <option key={client.id} value={client.id}>
                                                            {client.company_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Plant*</label>
                                                <select
                                                    value={data.plant_id}
                                                    onChange={(e) => setData('plant_id', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                    // Disable only if plant is selected and at least one item exists
                                                    disabled={data.plant_id !== '' && data.ordered_items.some(item => item.item_code !== '')}
                                                >
                                                    <option value="">Select Plant</option>
                                                    {plants.map((plant) => (
                                                        <option key={plant.id} value={plant.id}>
                                                            {plant.plant_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.plant_id && <div className="text-errorRed text-sm">{errors.plant_id}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Order Status</label>
                                                <select
                                                    value={data.order_status}
                                                    onChange={(e) => setData('order_status', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                >
                                                    <option value="">Select Status</option>
                                                    {(user.roles[0] === 'Store Manager' || user.roles[0] === 'Super Admin') && (
                                                        <option value="pr_requsted">PR Requsted</option>
                                                    )}
                                                </select>
                                                {errors.order_status && <div className="text-errorRed text-sm">{errors.order_status}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">PO Date*</label>
                                                <input
                                                    type="date"
                                                    value={data.po_date}
                                                    onChange={(e) => setData('po_date', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                />
                                                {errors.po_date && <div className="text-errorRed text-sm">{errors.po_date}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-gray-700">Expected Delivery Date</label>
                                                <input
                                                    type="date"
                                                    value={data.expected_delivery_date}
                                                    onChange={(e) => setData('expected_delivery_date', e.target.value)}
                                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                />
                                                {errors.expected_delivery_date && <div className="text-errorRed text-sm">{errors.expected_delivery_date}</div>}
                                            </div>
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
                                                {errors.file_url && <div className="text-red-600">{errors.file_url}</div>}
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-2xl mb-4">Order Item Details</h3>
                                        {data.ordered_items.map((item, index) => (
                                            <div key={index} className="border p-4 mb-2 relative">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                                    <div>
                                                        <label className="block text-gray-700">Item Code</label>
                                                        <SearchableSelect
                                                            options={vendorMaterials}
                                                            value={item.item_code}
                                                            onChange={(val) => handleItemCodeChange(index, val)}
                                                            className="w-full mt-1 border border-gray-300 rounded-md shadow-sm p-2 text-gray-500 text-sm min-h-[41px]"
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
                                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                        />
                                                        {errors[`ordered_items.${index}.hsn_sac_code`] && (
                                                            <div className="text-errorRed text-sm">{errors[`ordered_items.${index}.hsn_sac_code`]}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700">Quantity*</label>
                                                        <input
                                                            type="number"
                                                            placeholder="Quantity"
                                                            value={item.quantity}
                                                            onChange={(e) => updateOrderedItem(index, 'quantity', e.target.value)}
                                                            onBlur={(e) => updateOrderedItem(index, 'quantity', e.target.value)}
                                                            step={
                                                                vendorMaterials.find(mat => mat.material_code === item.item_code)
                                                                    ? vendorMaterials.find(mat => mat.material_code === item.item_code).material_quantity
                                                                    : 1
                                                            }
                                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                        />
                                                        {vendorMaterials.find(mat => mat.material_code === item.item_code) && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Quantity should be a multiple of{' '}
                                                                {
                                                                    vendorMaterials.find(mat => mat.material_code === item.item_code).material_quantity
                                                                }
                                                            </p>
                                                        )}
                                                        {errors[`ordered_items.${index}.quantity`] && (
                                                            <div className="text-errorRed text-sm">{errors[`ordered_items.${index}.quantity`]}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700">Unit*</label>
                                                        <select
                                                            value={item.unit}
                                                            onChange={(e) => updateOrderedItem(index, 'unit', e.target.value)}
                                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                        >
                                                            <option value="Kgs">Kgs</option>
                                                        </select>
                                                        {errors[`ordered_items.${index}.unit`] && (
                                                            <div className="text-errorRed text-sm">{errors[`ordered_items.${index}.unit`]}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-[1fr_auto] gap-6 items-end mt-4">
                                                    <div>
                                                        <label className="block text-gray-700">Item Description*</label>
                                                        <input
                                                            placeholder="Item Description"
                                                            value={item.item_description}
                                                            readOnly
                                                            className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
                                                        />
                                                        {errors[`ordered_items.${index}.item_description`] && (
                                                            <div className="text-errorRed text-sm">{errors[`ordered_items.${index}.item_description`]}</div>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOrderedItem(index)}
                                                        className="bg-red-500 text-white px-2 py-1 rounded mt-2 min-h-10"
                                                    >
                                                        Remove Item
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="button-box flex gap-2">
                                            <button type="button" onClick={addNewOrderedItem} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
                                                Add Item
                                            </button>
                                            <button type="button" onClick={handleNext} disabled={processing} className="bg-white text-red px-4 py-2 rounded mt-4 border-btn">
                                                Preview & Next
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="preview-section mt-4">
                                    {Object.keys(errors).length > 0 && (
                                        <div className="bg-yellow-100 text-yellow-800 p-2 mb-4 rounded">
                                            Warning: There are errors in the form. Please correct them before publishing.
                                        </div>
                                    )}
                                    <h3 className="font-semibold text-2xl mb-4">Preview Vendor Purchase Order</h3>
                                    <div className="bg-lightGrayTheme p-6 mb-4">
                                        <h3 className="font-semibold text-lg mb-4 text-black">PO Details</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <p><strong>PO Number:</strong> {data.po_number}</p>
                                            <p><strong>PO Date:</strong> {data.po_date ? new Date(data.po_date).toLocaleDateString('en-IN') : 'N/A'}</p>
                                            <p><strong>Expected Delivery Date:</strong> {data.expected_delivery_date ? new Date(data.expected_delivery_date).toLocaleDateString('en-IN') : 'N/A'}</p>
                                            <p>
                                                <strong>Uploaded File:</strong>{' '}
                                                {data.file_url ? (
                                                    <a className="text-red font-bold" target="_blank" rel="noopener noreferrer" href={data.file_url}>
                                                        View
                                                    </a>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-lightGrayTheme p-6 mb-4 grid grid-cols-2 gap-4">
                                        <div className="flex-col flex gap-2 align-top">
                                            <h3 className="font-semibold text-lg mb-1 text-black">Plant Details</h3>
                                            <p>
                                                <strong>Plant:</strong>{' '}
                                                {plants.length > 0 && data.plant_id
                                                    ? plants.find(plant => String(plant.id) === String(data.plant_id))?.plant_name || 'N/A'
                                                    : 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Address:</strong>{' '}
                                                {plants.length > 0 && data.plant_id
                                                    ? `${plants.find(plant => String(plant.id) === String(data.plant_id))?.city || 'N/A'} ${plants.find(plant => String(plant.id) === String(data.plant_id))?.address || 'N/A'} ${plants.find(plant => String(plant.id) === String(data.plant_id))?.state || 'N/A'} ${plants.find(plant => String(plant.id) === String(data.plant_id))?.zip || 'N/A'}`
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <h3 className="font-semibold text-lg mb-1 text-black">Vendor Details</h3>
                                            <p>
                                                <strong>Name:</strong>{' '}
                                                {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.company_name || 'N/A'
                                                    : 'N/A'}
                                            </p>
                                            <p>
                                                <strong>GSTIN Number:</strong>{' '}
                                                {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.gstin_number || 'N/A'
                                                    : 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Mobile No:</strong>{' '}
                                                {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.mobile_number || 'N/A'
                                                    : 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Pan No:</strong>{' '}
                                                {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.pan_card || 'N/A'
                                                    : 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Address:</strong>{' '}
                                                {players.length > 0 && data.client_id
                                                    ? players.find(client => String(client.id) === String(data.client_id))?.company_address || 'N/A'
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-lightGrayTheme p-6 mb-4 gap-4">
                                        <h3 className="font-semibold text-lg mb-4 text-gray-600">Items Details</h3>
                                        <div>
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="text-left border-b">
                                                        <th className="p-2 font-semibold text-red">Item Code</th>
                                                        <th className="p-2 font-semibold text-red">HSN/SAC CODE</th>
                                                        <th className="p-2 font-semibold text-red">Item Description</th>
                                                        <th className="p-2 font-semibold text-red">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.ordered_items
                                                        .filter(item => !item._deleted)
                                                        .map((item, index) => (
                                                            <tr key={index}>
                                                                <td className="p-2 font-bold">{item.item_code}</td>
                                                                <td className="p-2">{item.hsn_sac_code}</td>
                                                                <td className="p-2">{item.item_description}</td>
                                                                <td className="p-2">
                                                                    {item.quantity} {item.unit}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button type="button" onClick={handleBack} className="bg-white border border-red text-red px-4 py-2 rounded">
                                            Back To Edit PO
                                        </button>
                                        <button onClick={handleSubmit} disabled={processing} className="ml-4 px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-red-800">
                                            Publish PO
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
