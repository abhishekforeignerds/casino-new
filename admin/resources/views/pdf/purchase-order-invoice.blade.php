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
            background-color: green;
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
            <hr>
        </div>
    </div>

    <div className="section">
        <h3>Ordered Items</h3>
        @foreach ($orderedItems as $item)
        <div className="details">
            <p><strong>Item Code:</strong> {{ $item->item_code ?? 'N/A' }}</p>
            <p><strong>Description:</strong> {{ $item->item_description ?? 'N/A' }}</p>
            <p><strong>Quantity:</strong> {{ $item->quantity ?? 'N/A' }}</p>
            <p><strong>Unit:</strong> {{ $item->unit ?? 'N/A' }}</p>
            @php
            // Map the ordered item's item_code to the finished good grouping key.
            $finishedGoodKey = $item->item_code;
            $unitCost = 0;
            // Check if the grouping data has an entry for this finished good.
            if(isset($groupedFinishedGoods[$finishedGoodKey])){
            // total_price here is the cost to produce one unit of the finished good.
            $unitCost = $groupedFinishedGoods[$finishedGoodKey]['total_price'];
            }
            // Multiply the unit cost by the quantity ordered to get the total price.
            $totalCost = $unitCost * $item->quantity;
            @endphp
            <p><strong>Total Price:</strong> ₹{{ number_format($totalCost, 2) }}</p>
            <hr>
        </div>
        @endforeach
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