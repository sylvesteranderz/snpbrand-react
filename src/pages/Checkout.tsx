import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, User, Mail, Phone, ArrowLeft, Lock, CheckCircle, Truck, Wallet } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCartSupabase'
import { formatPrice } from '../utils/currency'
import OrderConfirmation from './OrderConfirmation'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  paymentMethod: 'paystack' | 'pay_on_delivery'
}

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'paystack'
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePaymentMethodChange = (method: 'paystack' | 'pay_on_delivery') => {
    setFormData(prev => ({ ...prev, paymentMethod: method }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {}

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.state.trim()) newErrors.state = 'State is required'
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
      if (!formData.country.trim()) newErrors.country = 'Country is required'
    }

    if (step === 3) {
      if (formData.paymentMethod === 'paystack') {
        if (!formData.email.trim()) newErrors.email = 'Email is required for payment'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsProcessing(true)
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`
    
    // Calculate estimated delivery (3-5 business days)
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 5)
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    // Create order data
    const order = {
      orderNumber,
      customerInfo: formData,
      items: items,
      paymentMethod: formData.paymentMethod,
      total: totalPrice + (totalPrice * 0.08) + (formData.paymentMethod === 'pay_on_delivery' ? 500 : 0),
      estimatedDelivery
    }
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setOrderData(order)
    setIsComplete(true)
    
    // Clear cart after successful order
    setTimeout(() => {
      clearCart()
    }, 3000)
  }

  if (items.length === 0 && !isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to proceed to checkout</p>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  if (isComplete && orderData) {
    return <OrderConfirmation {...orderData} />
  }

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Shipping', icon: MapPin },
    { number: 3, title: 'Payment', icon: CreditCard }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cart</span>
            </Link>
          </div>
          <h1 className="text-3xl font-chilanka font-normal text-gray-900">
            Checkout
          </h1>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep >= step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-primary-500 border-primary-500 text-white' 
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 font-medium ${
                    isActive ? 'text-primary-500' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your street address"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="City"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.state ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="State"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.zipCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="ZIP Code"
                        />
                        {errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Country"
                      />
                      {errors.country && (
                        <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                  
                  {/* Payment Method Selection */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Paystack Option */}
                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.paymentMethod === 'paystack' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handlePaymentMethodChange('paystack')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.paymentMethod === 'paystack' 
                              ? 'border-primary-500 bg-primary-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'paystack' && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                            )}
                          </div>
                          <Wallet className="w-6 h-6 text-primary-500" />
                          <div>
                            <h3 className="font-medium text-gray-900">Pay Online</h3>
                            <p className="text-sm text-gray-500">Secure payment with Paystack</p>
                          </div>
                        </div>
                      </div>

                      {/* Pay on Delivery Option */}
                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.paymentMethod === 'pay_on_delivery' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handlePaymentMethodChange('pay_on_delivery')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.paymentMethod === 'pay_on_delivery' 
                              ? 'border-primary-500 bg-primary-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'pay_on_delivery' && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                            )}
                          </div>
                          <Truck className="w-6 h-6 text-primary-500" />
                          <div>
                            <h3 className="font-medium text-gray-900">Pay on Delivery</h3>
                            <p className="text-sm text-gray-500">Pay when your order arrives</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Details */}
                  {formData.paymentMethod === 'paystack' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Secure Online Payment</h4>
                          <p className="text-sm text-blue-700">
                            Your payment will be processed securely through Paystack. 
                            You can pay with your card, bank transfer, or mobile money.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'pay_on_delivery' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Truck className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900 mb-1">Pay on Delivery</h4>
                          <p className="text-sm text-green-700">
                            Pay cash or card when your order is delivered. 
                            A small delivery fee may apply.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 border rounded-md transition-colors ${
                    currentStep === 1
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>
                          {formData.paymentMethod === 'paystack' ? 'Processing Payment...' : 'Processing Order...'}
                        </span>
                      </>
                    ) : (
                      <>
                        {formData.paymentMethod === 'paystack' ? (
                          <>
                            <Wallet className="w-4 h-4" />
                            <span>Pay Now</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-4 h-4" />
                            <span>Place Order</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm p-6 border sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center space-x-3">
                    <img
                      src={item.product?.image || item.image || '/images/placeholder.jpg'}
                      alt={item.product?.name || item.name || 'Product'}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || item.name || 'Product'}
                      </h4>
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                      )}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice((item.product?.price || item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {formData.paymentMethod === 'pay_on_delivery' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">{formatPrice(500)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(totalPrice * 0.08)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      totalPrice + 
                      (totalPrice * 0.08) + 
                      (formData.paymentMethod === 'pay_on_delivery' ? 500 : 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Method Display */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {formData.paymentMethod === 'paystack' ? (
                    <>
                      <Wallet className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Pay Online</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-medium text-gray-700">Pay on Delivery</span>
                    </>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Lock className="w-4 h-4" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default Checkout