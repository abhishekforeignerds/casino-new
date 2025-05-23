<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactSeller extends Model
{
    use HasFactory;

    protected $table = 'contact_seller';
    protected $fillable = ['seller_id', 'client_id', 'message', 'po_id'];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}

