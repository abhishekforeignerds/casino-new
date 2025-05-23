{{-- resources/views/pdf/purchase-order.blade.php --}}
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Purchase Order PDF</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 14px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .section {
            margin-bottom: 20px;
        }

        .section h3 {
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
        }

        .details {
            margin-left: 20px;
        }

        .details p {
            margin: 4px 0;
        }
    </style>
</head>

<body>
    <div className="header">
        <h1>Purchase Order Details</h1>
    </div>

    <div className="section">
        <h3>Purchase Order Information</h3>
        <div className="details">
            <p><strong>PO Number:</strong> {{ $purchaseOrder->po_number ?? 'N/A' }}</p>
            <p><strong>Client:</strong> {{ $purchaseOrder->client->name ?? 'N/A' }}</p>
            <p><strong>PO Date:</strong> {{ $purchaseOrder->po_date ?? 'N/A' }}</p>
            <p><strong>Status:</strong> {{ $purchaseOrder->order_status ?? 'N/A' }}</p>
        </div>
    </div>

    <div className="section">
        <h3>Ordered Items</h3>
        @if($orderedItems->count())
        @foreach ($orderedItems as $item)
        <div className="details">
            <p><strong>Item Code:</strong> {{ $item->item_code ?? 'N/A' }}</p>
            <p><strong>Description:</strong> {{ $item->item_description ?? 'N/A' }}</p>
            <p><strong>Quantity:</strong> {{ $item->quantity ?? 'N/A' }}</p>
            <p><strong>Unit:</strong> {{ $item->unit ?? 'N/A' }}</p>
            <hr>
        </div>
        @endforeach
        @else
        <p>No ordered items found.</p>
        @endif
    </div>

    <div className="section">
        <h3>Plant Details</h3>
        <div className="details">
            <p><strong>Plant Name:</strong> {{ $plantDetails->plant_name ?? 'N/A' }}</p>
            <p><strong>Address:</strong> {{ $plantDetails->address ?? 'N/A' }}</p>
            <p><strong>City:</strong> {{ $plantDetails->city ?? 'N/A' }}</p>
            <p><strong>State/Region:</strong> {{ $plantDetails->state ?? 'N/A' }}</p>
            <p><strong>Zip Code:</strong> {{ $plantDetails->zip ?? 'N/A' }}</p>
            <p><strong>Country:</strong> {{ $plantDetails->country ?? 'N/A' }}</p>
        </div>
    </div>
</body>

</html>