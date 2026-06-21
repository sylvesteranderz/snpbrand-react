import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, AlertCircle, ShoppingBag, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/currency';

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  image?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'paystack' | 'pay_on_delivery';
  payment_status: string | null;
  shipping_address: any;
  items: OrderItem[];
  customer_info?: any;
  customer_name?: string | null;
  customer_phone?: string | null;
  created_at: string;
  user_profiles?: {
    name: string;
    email: string;
    phone: string;
  } | null;
}

interface OrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
  onOrderUpdated: () => void;
}

const formatDateTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${formattedDate} at ${formattedTime}`;
  } catch (e) {
    return dateStr;
  }
};

const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'text-primary-700 bg-primary-50 border-primary-200';
    case 'confirmed':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'processing':
      return 'text-purple-700 bg-purple-50 border-purple-200';
    case 'shipped':
      return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    case 'delivered':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'cancelled':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  orderId,
  onClose,
  onOrderUpdated,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select(`
          *,
          user_profiles (
            name,
            email,
            phone
          )
        `)
        .eq('id', orderId)
        .single();

      if (fetchErr) throw fetchErr;
      setOrder(data as Order);
    } catch (err: any) {
      setError('Could not load order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
    }
  }, [orderId, fetchOrderDetails]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!orderId || !supabase) return;
    try {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      await fetchOrderDetails();
      onOrderUpdated();
    } catch (err: any) {
      alert('Failed to update status.');
    }
  };

  const handleCopyPhone = (phoneStr: string) => {
    navigator.clipboard.writeText(phoneStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOpen = !!orderId;

  // Next status transition flow
  let nextStatus: string | null = null;
  let nextStatusLabel: string | null = null;

  if (order) {
    if (order.status === 'pending') {
      nextStatus = 'confirmed';
      nextStatusLabel = 'Confirm Order';
    } else if (order.status === 'confirmed') {
      nextStatus = 'shipped';
      nextStatusLabel = 'Ship Order';
    } else if (order.status === 'shipped') {
      nextStatus = 'delivered';
      nextStatusLabel = 'Deliver Order';
    }
  }

  const showCancelLink = order && (order.status === 'pending' || order.status === 'confirmed');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full sm:w-[420px] max-w-full bg-white h-full shadow-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Order Details
                </span>
                {order && (
                  <h3 className="text-lg font-mono font-bold text-gray-900 mt-0.5">
                    {order.order_number}
                  </h3>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                title="Close drawer"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="border-t border-gray-100 pt-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="border-t border-gray-100 pt-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-16 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <p className="text-gray-600 text-sm font-semibold">{error}</p>
                  <button
                    onClick={fetchOrderDetails}
                    className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {order && !loading && (
                <>
                  {/* Info Header Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Placed {formatDateTime(order.created_at)}</span>
                  </div>

                  {/* Status Section */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </span>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      {nextStatus && nextStatusLabel && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(nextStatus!)}
                          className="w-full py-2.5 bg-gray-900 hover:bg-black text-[#DEAD6F] text-xs font-bold rounded-xl transition-all shadow-md"
                        >
                          {nextStatusLabel}
                        </button>
                      )}

                      {showCancelLink && (
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus('cancelled')}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                          >
                            Cancel order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Customer
                    </h4>
                    <div className="space-y-2.5 text-sm text-gray-700">
                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-900">
                          {order.customer_info?.Name ||
                            (order.customer_info?.firstName
                              ? `${order.customer_info.firstName} ${order.customer_info.lastName}`.trim()
                              : order.user_profiles?.name) ||
                            'Unknown'}
                        </span>
                      </div>

                      {/* Email */}
                      {(order.customer_info?.email || order.user_profiles?.email) && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {order.customer_info?.email || order.user_profiles?.email}
                          </span>
                        </div>
                      )}

                      {/* Phone */}
                      {(order.customer_info?.phone || order.user_profiles?.phone) && (
                        <div className="flex items-center justify-between gap-3 bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="font-mono text-xs">
                              {order.customer_info?.phone || order.user_profiles?.phone}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyPhone(
                                order.customer_info?.phone || order.user_profiles?.phone || ''
                              )
                            }
                            className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-all flex items-center gap-1.5 shrink-0"
                            title="Copy phone number"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-[10px] text-green-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Items
                    </h4>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                          <div>
                            <div className="font-bold text-gray-950">{item.name}</div>
                            <div className="flex items-center gap-2 text-gray-400 mt-1">
                              {item.selected_size && (
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold">
                                  Size {item.selected_size}
                                </span>
                              )}
                              <span>
                                {item.quantity} × {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                          <div className="font-bold text-gray-950 shrink-0">
                            {formatPrice(item.quantity * item.price)}
                          </div>
                        </div>
                      ))}
                      
                      {/* Total */}
                      <div className="p-3.5 bg-gray-50/50 flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-500">Total</span>
                        <span className="font-bold text-gray-950 text-base">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  {(order.payment_method || order.payment_status) && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Payment
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-2">
                        {order.payment_method && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Method</span>
                            <span className="font-bold text-gray-800 capitalize flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                              {order.payment_method.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                        {order.payment_status && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Status</span>
                            <span className="font-extrabold text-gray-800 uppercase">
                              {order.payment_status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderDetailDrawer;
