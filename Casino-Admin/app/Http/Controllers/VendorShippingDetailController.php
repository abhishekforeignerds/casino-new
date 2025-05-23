<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\VendorShippingDetail;


class VendorShippingDetailController extends Controller
{


    public function store(Request $request)
{
    // Define basic validation rules
    $rules = [
        'po_id' => 'required',
        'tracking_number' => 'required|string',
        'file_url' => 'required|file|mimes:pdf|max:2048', // Accept only PDFs, max 2MB
        'expected_delivery_date' => 'required|date',
    ];

    // Optionally enforce uniqueness on create
    if (!VendorShippingDetail::where('po_id', $request->po_id)->exists()) {
        $rules['po_id'] .= '|unique:vendor_shipping_details';
        $rules['tracking_number'] .= '|unique:vendor_shipping_details';
    }

    $validated = $request->validate($rules);

    $filePath = null;
    if ($request->hasFile('file_url')) {
        $file = $request->file('file_url');
        $filePath = time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('shipping_docs'), $filePath);
    }

    // Update the record if one exists, or create a new one.
    VendorShippingDetail::updateOrCreate(
        ['po_id' => $validated['po_id']], // Condition to check if record exists
        [
            'tracking_number' => $validated['tracking_number'],
            'file_url' => '/shipping_docs/' . $filePath, // Store the accessible file path
            'expected_delivery_date' => $validated['expected_delivery_date'],
        ]
    );

    return redirect()->back()->with('success', 'Shipping detail saved successfully!');
}


}