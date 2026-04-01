import React from 'react';
import { Printer } from 'lucide-react';

interface ReceiptProps {
  receipt: {
    saleId: string | number;
    date: string;
    items: any[];
    total: number;
    amountPaid: number;
    change: number;
    paymentMethod: string;
  };
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`;

  // Shorten sale ID to 8 chars and uppercase
  const shortSaleId = String(receipt.saleId).substring(0, 8).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:bg-white print:static print:inset-auto print:flex-none print:items-start print:justify-start">
      <div className="w-full max-w-sm bg-white p-6 rounded shadow-lg print:shadow-none print:w-[80mm] print:p-0 print:m-0 print:border-none">
        
        {/* Receipt Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">SNP BRAND STORE</h2>
          <p className="text-sm text-gray-500">Official Retail Partner</p>
          <div className="mt-2 text-xs text-gray-400">
            <p>{new Date(receipt.date).toLocaleString()}</p>
            <p>Sale ID: #{shortSaleId}</p>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-300 my-4"></div>

        {/* Receipt Items */}
        <div className="space-y-2 text-sm">
          {receipt.items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <div className="flex-1">
                <span className="font-medium">{item.name}</span>
                <div className="text-xs text-gray-500">
                  {item.cartQuantity} × {formatCurrency(item.price)}
                </div>
              </div>
              <div className="font-medium">
                {formatCurrency(item.price * item.cartQuantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-300 my-4"></div>

        {/* Receipt Totals */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(receipt.total)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Payment ({receipt.paymentMethod})</span>
            <span>{formatCurrency(receipt.amountPaid)}</span>
          </div>
          {receipt.paymentMethod === 'Cash' && (
            <div className="flex justify-between text-gray-600">
              <span>Change</span>
              <span>{formatCurrency(receipt.change)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-300 my-4"></div>

        <div className="text-center text-sm font-medium mt-4">
          <p>Thank you!</p>
          <p className="text-xs text-gray-400 mt-1">Please keep this receipt for your records.</p>
        </div>

        {/* Action Buttons (Not printed) */}
        <div className="mt-6 flex space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 bg-black text-white px-4 py-2 rounded font-medium hover:bg-gray-800 transition"
          >
            <Printer size={18} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 transition"
          >
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
