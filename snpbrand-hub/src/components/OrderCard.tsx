import React, { useState } from 'react';
import { Phone, Calendar, User, ShoppingBag, AlertCircle, CheckCircle, RefreshCcw, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Order, OrderItem } from '../hooks/useAccraOrders';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../hooks/useAppContext';

interface OrderCardProps {
  order: Order;
  locationsMap: { Accra: string; Kumasi: string };
  productsList: { id: string; name: string }[];
  onFulfilled: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  locationsMap,
  productsList,
  onFulfilled,
}) => {
  const { role } = useAuth();
  const { setOrders, setStock } = useAppContext();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [fulfilling, setFulfilling] = useState<boolean>(false);
  const [reassigning, setReassigning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resolveProductId = (item: OrderItem) => {
    if (item.product_id) return item.product_id;

    const nameToSearch = item.product_name || item.name;
    if (!nameToSearch) return null;
    const normalizedItemName = nameToSearch.trim().toLowerCase();
    const found = productsList.find(
      (p) => p.name.trim().toLowerCase() === normalizedItemName
    );
    return found ? found.id : null;
  };

  const handleFulfill = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling collapse when clicking action button
    setFulfilling(true);
    setError(null);

    try {
      const locName = order.fulfillment_location === 'Accra' ? 'Accra' : 'Kumasi';
      const targetLocId = locationsMap[locName];

      if (!targetLocId) {
        throw new Error(`Location ID for "${locName}" is not resolved yet. Please try again.`);
      }

      const resolvedItems: (OrderItem & { resolvedProductId: string })[] = [];
      for (const item of order.items) {
        const pId = resolveProductId(item);
        if (!pId) {
          const name = item.product_name || item.name || 'Unknown Product';
          throw new Error(`Could not resolve product: ${name}`);
        }
        resolvedItems.push({
          ...item,
          resolvedProductId: pId,
        });
      }

      for (const item of resolvedItems) {
        const itemSize = item.size || item.selected_size || 'N/A';
        const itemName = item.product_name || item.name || 'Unknown Product';
        const { error: rpcErr } = await supabase.rpc('apply_stock_change', {
          p_product_id: item.resolvedProductId,
          p_size: itemSize,
          p_location_id: targetLocId,
          p_delta: -item.quantity,
          p_type: 'sale',
          p_note: `Hub fulfillment — order ${order.order_number}`,
          p_unit_cost: item.price,
        });

        if (rpcErr) {
          throw new Error(`Stock change failed for "${itemName}" (${itemSize}): ${rpcErr.message}`);
        }
      }

      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: 'delivered', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      if (updateErr) {
        throw new Error(`Failed to update order status to delivered: ${updateErr.message}`);
      }

      // Decrement stock levels locally in memory immediately
      setStock((prevStock) => {
        let updatedStock = [...prevStock];
        for (const item of resolvedItems) {
          const itemSize = item.size || item.selected_size;
          updatedStock = updatedStock.map((sItem) =>
            sItem.product_id === item.resolvedProductId && sItem.size === itemSize
              ? { ...sItem, quantity: Math.max(0, sItem.quantity - item.quantity) }
              : sItem
          );
        }
        return updatedStock;
      });

      // Remove order from local list immediately
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));

      onFulfilled(order.id);
    } catch (err: any) {
      console.error('Order fulfillment error:', err);
      setError(err.message || 'Failed to fulfill order. Please check stock levels.');
    } finally {
      setFulfilling(false);
    }
  };

  const handleReassign = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling collapse when clicking reassign button
    setReassigning(true);
    setError(null);
    try {
      const currentLocName = order.fulfillment_location === 'Accra' ? 'Accra' : 'Kumasi';
      const nextLocName = currentLocName === 'Accra' ? 'Kumasi' : 'Accra';

      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          fulfillment_location: nextLocName,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateErr) throw updateErr;

      // Remove the order from the local list since its location has changed
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));
    } catch (err: any) {
      console.error('Reassignment failed:', err);
      setError(err.message || 'Failed to reassign order location.');
    } finally {
      setReassigning(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'processing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });  const resolvedCustomerName = order.customer_name || order.customer_info?.Name || (order.customer_info?.firstName ? `${order.customer_info.firstName} ${order.customer_info.lastName || ''}`.trim() : '') || 'N/A';
  const phoneToCall = order.customer_phone || order.customer_info?.phone || '+233240000000';
  const hasPhone = !!(order.customer_phone || order.customer_info?.phone);
  const resolvedShippingAddress = order.shipping_address?.address || order.customer_info?.address || 'Manual Storefront Pickup';
  const resolvedShippingCity = order.shipping_address?.city || order.customer_info?.city;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500/20">
      {/* CARD HEADER (Tapping toggles expand/collapse) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-gray-50/50 active:bg-gray-50 transition-colors flex flex-col space-y-3 cursor-pointer"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex justify-between items-start w-full">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Order Number</span>
            <span className="text-base font-bold text-gray-900">#{order.order_number}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeStyle(order.status)}`}>
              {order.status}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Little Details (Always visible) */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-2 w-full">
          <div className="flex items-center space-x-1 font-semibold text-gray-700">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate max-w-[150px]">{resolvedCustomerName}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-400">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {formattedDate}
            </span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
              {order.fulfillment_location || 'Kumasi'}
            </span>
          </div>
        </div>
      </button>

      {/* EXPANDED DETAILS BODY */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-50 bg-white space-y-4 pt-4 animate-fade-in">
          {/* 1. Items List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
              <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Items Ordered
            </h4>
            <div className="bg-gray-50/50 rounded-lg border border-gray-100 divide-y divide-gray-150/50 overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{item.product_name || item.name || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      Size: <span className="font-bold text-gray-700 uppercase">{item.size || item.selected_size || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">x{item.quantity}</p>
                    <p className="text-xs text-gray-500">GHS {Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Order Total */}
          <div className="flex justify-between items-center text-sm font-bold bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="text-gray-500 uppercase tracking-wider text-xs">Total Amount</span>
            <span className="text-gray-900 text-base font-black">GHS {Number(order.total_amount).toFixed(2)}</span>
          </div>

          {/* 3. Delivery Location */}
          <div className="text-sm space-y-1 bg-gray-50/30 p-3 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center mb-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1" /> Delivery Location
            </span>
            <span className="text-gray-800 font-semibold">
              {resolvedShippingAddress}
            </span>
            {resolvedShippingCity && (
              <span className="text-xs text-gray-500 block font-bold uppercase tracking-wider">
                City: {resolvedShippingCity}
              </span>
            )}
          </div>

          {/* 4. Call Customer Button */}
          <a
            href={`tel:${phoneToCall}`}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 font-bold rounded-xl text-sm border border-emerald-100 min-h-[44px] py-2.5 transition-all active:scale-[0.98]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Phone className="w-4 h-4 stroke-[2.5]" />
            <span>Call Customer ({phoneToCall}{!hasPhone && ' [Test]'})</span>
          </a>
          {/* Error notifications inside card */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* 5. Fulfill & Reassign Actions */}
          <div className="flex space-x-3 pt-2">
            {role === 'admin' && (
              <button
                type="button"
                onClick={handleReassign}
                disabled={reassigning || fulfilling}
                className="flex-1 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs border border-gray-200 flex items-center justify-center space-x-1.5 active:scale-[0.97] transition-all disabled:opacity-50 min-h-[48px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${reassigning ? 'animate-spin' : ''}`} />
                <span>
                  {order.fulfillment_location === 'Accra' ? 'Send to Kumasi' : 'Send to Accra'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleFulfill}
              disabled={fulfilling || reassigning}
              className={`${role === 'admin' ? 'flex-[1.5]' : 'w-full'} flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold rounded-xl text-sm shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 min-h-[48px]`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {fulfilling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Fulfilling...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Fulfilled</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
