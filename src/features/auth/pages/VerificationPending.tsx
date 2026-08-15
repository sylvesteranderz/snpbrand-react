import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuthSupabase'

const VerificationPending = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { resendVerificationEmail } = useAuth()

    const [isResending, setIsResending] = useState(false)
    const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

    // OTP state — 6 individual digits
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
    const [isVerifying, setIsVerifying] = useState(false)
    const [otpError, setOtpError] = useState<string | null>(null)
    const [isVerified, setIsVerified] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Email passed from Signup page
    const email = location.state?.email

    // Polling: auto-redirect if user verified via link in another tab
    useEffect(() => {
        let isMounted = true
        const checkVerification = async () => {
            if (!supabase) return
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) return
            if (session?.user && session.user.email_confirmed_at) {
                if (isMounted) navigate('/')
            }
        }
        const interval = setInterval(checkVerification, 3000)
        return () => { isMounted = false; clearInterval(interval) }
    }, [navigate])

    const handleResend = async () => {
        if (!email) {
            setResendStatus({ type: 'error', message: 'Email address not found. Please try signing up again.' })
            return
        }
        setIsResending(true)
        setResendStatus({ type: null, message: '' })
        try {
            await resendVerificationEmail(email)
            setResendStatus({ type: 'success', message: 'Verification email resent! Check your inbox.' })
            // Clear OTP inputs on resend
            setOtp(['', '', '', '', '', ''])
            setOtpError(null)
            inputRefs.current[0]?.focus()
        } catch (error: any) {
            setResendStatus({ type: 'error', message: error.message || 'Failed to resend. Please wait a minute and try again.' })
        } finally {
            setIsResending(false)
        }
    }

    // Handle individual digit input
    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1) // only digits, last char
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)
        setOtpError(null)

        // Auto-advance to next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    // Handle pasting a full 6-digit code
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setOtp(pasted.split(''))
            setOtpError(null)
            inputRefs.current[5]?.focus()
        }
    }

    const handleVerifyOtp = async () => {
        const code = otp.join('')
        if (code.length < 6) {
            setOtpError('Please enter all 6 digits.')
            return
        }
        if (!email) {
            setOtpError('Email address not found. Please try signing up again.')
            return
        }
        if (!supabase) return

        setIsVerifying(true)
        setOtpError(null)

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'signup',
            })

            if (error) {
                setOtpError(error.message || 'Invalid or expired code. Please try again.')
                setOtp(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
            } else {
                setIsVerified(true)
                setTimeout(() => navigate('/'), 1500)
            }
        } catch (err: any) {
            setOtpError('Something went wrong. Please try again.')
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gray-50 px-8 py-6 text-center border-b border-gray-200">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-50 border border-primary-200 mb-4">
                            <Mail className="h-7 w-7 text-primary-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
                        <p className="text-gray-400 text-sm mt-2">
                            We've sent a verification email to{' '}
                            <span className="text-primary-600 font-medium">{email || 'your inbox'}</span>
                        </p>
                    </div>

                    <div className="px-8 py-8 space-y-8">
                        {/* Verified success */}
                        <AnimatePresence>
                            {isVerified && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-3 py-4"
                                >
                                    <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-7 w-7 text-green-400" />
                                    </div>
                                    <p className="text-green-700 font-semibold text-lg">Email Verified!</p>
                                    <p className="text-gray-500 text-sm">Redirecting you to the homepage…</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isVerified && (
                            <>
                                {/* Option 1 — Link */}
                                <div>
                                    <p className="text-sm text-gray-500 text-center">
                                        Click the link in the email to verify instantly.{' '}
                                        <span className="italic text-gray-500">This page auto-refreshes once verified.</span>
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-4 bg-white text-gray-400 uppercase tracking-widest">
                                            or enter the code manually
                                        </span>
                                    </div>
                                </div>

                                {/* OTP Input */}
                                <div>
                                    <div className="flex items-center gap-2 justify-center mb-4" onPaste={handleOtpPaste}>
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={el => { inputRefs.current[index] = el }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(index, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(index, e)}
                                                className={`w-11 h-13 text-center text-xl font-bold rounded-lg border bg-white text-gray-900
                                                    transition-all duration-150 outline-none focus:ring-2
                                                    ${otpError
                                                        ? 'border-red-400 focus:ring-red-400/40'
                                                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/30'
                                                    }`}
                                                style={{ height: '52px' }}
                                            />
                                        ))}
                                    </div>

                                    <AnimatePresence>
                                        {otpError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-red-400 text-xs text-center mb-3"
                                            >
                                                {otpError}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifying || otp.join('').length < 6}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                                            bg-primary-500 text-black font-semibold text-sm
                                            hover:bg-primary-400 transition-colors duration-200
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isVerifying ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ShieldCheck className="w-4 h-4" />
                                        )}
                                        {isVerifying ? 'Verifying…' : 'Verify Code'}
                                    </button>
                                </div>

                                {/* Resend Status */}
                                <AnimatePresence>
                                    {resendStatus.type && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`p-3 rounded-lg text-sm text-center ${resendStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                                        >
                                            {resendStatus.type === 'success' && <CheckCircle2 className="inline w-4 h-4 mr-1" />}
                                            {resendStatus.message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Footer Actions */}
                                <div className="space-y-3 pt-2 border-t border-gray-200">
                                    <button
                                        onClick={handleResend}
                                        disabled={isResending}
                                        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300
                                            rounded-xl text-sm font-medium text-gray-700 bg-white
                                            hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {isResending && <RefreshCw className="w-4 h-4 animate-spin" />}
                                        {isResending ? 'Resending…' : 'Resend Verification Email'}
                                    </button>

                                    <Link
                                        to="/login"
                                        className="block w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium
                                            text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        Return to Sign In
                                    </Link>

                                    <Link
                                        to="/"
                                        className="flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        Back to Home
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default VerificationPending
