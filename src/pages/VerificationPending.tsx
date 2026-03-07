import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuthSupabase'

const VerificationPending = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { resendVerificationEmail } = useAuth()

    const [isResending, setIsResending] = useState(false)
    const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

    // Email passed from Signup page
    const email = location.state?.email

    // Polling mechanism to check if the user verified on their phone/another tab
    useEffect(() => {
        let isMounted = true;

        const checkVerification = async () => {
            if (!supabase) return;

            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error("Session polling error", error)
                return
            }

            if (session?.user && session.user.email_confirmed_at) {
                // If confirmed, navigate automatically to the home page (or dashboard)
                if (isMounted) navigate('/')
            }
        }

        const interval = setInterval(checkVerification, 3000)

        // Cleanup interval
        return () => {
            isMounted = false;
            clearInterval(interval)
        }
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
            setResendStatus({ type: 'success', message: 'Verification email resent successfully! Check your inbox.' })
        } catch (error: any) {
            setResendStatus({ type: 'error', message: error.message || 'Failed to resend. Please wait a minute and try again.' })
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 rounded-lg shadow-sm border"
                >
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a verification link {email ? `to ${email}` : 'to your email address'}. Please click the link to activate your account.
                        <br /><br />
                        <span className="text-sm italic">This page will automatically refresh once verified.</span>
                    </p>

                    {resendStatus.type && (
                        <div className={`mb-6 p-4 rounded-md text-sm ${resendStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {resendStatus.type === 'success' && <CheckCircle2 className="inline w-4 h-4 mr-2" />}
                            {resendStatus.message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {isResending ? (
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin text-gray-400" />
                            ) : null}
                            {isResending ? 'Resending...' : 'Resend Verification Email'}
                        </button>

                        <Link
                            to="/login"
                            className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Return to Sign In
                        </Link>

                        <Link
                            to="/"
                            className="inline-flex mt-4 items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default VerificationPending
