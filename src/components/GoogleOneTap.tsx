
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const GoogleOneTap = () => {
    const navigate = useNavigate()

    useEffect(() => {
        if (!supabase) return;

        // Skip One Tap if we are processing an auth redirect
        if (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery')) {
            console.log('Skipping Google One Tap during auth redirect')
            return
        }

        const handleCredentialResponse = async (response: any) => {
            if (!supabase) return
            try {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: response.credential,
                })

                if (error) {
                    console.error('Error logging in with Google One Tap', error)
                    return
                }

                if (data.session) {
                    // Success! Redirect or handle session
                    console.log('Google One Tap success', data)
                    navigate('/')
                }
            } catch (error) {
                console.error('Error handling credential response', error)
            }
        }

        // Check if script is loaded
        const initializeGoogleOneTap = () => {
            if (!window.google) return

            // You need to get this from your env or Supabase config if exposed
            // For now we will use a placeholder or try to read from env
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

            if (!clientId) {
                console.warn('Google Client ID not found in environment variables (VITE_GOOGLE_CLIENT_ID)')
                return
            }

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
                use_fedcm_for_prompt: true,
                // cancel_on_tap_outside: false, // Optional
            })

            window.google.accounts.id.prompt() // FedCM handles the prompt display
        }

        // Wait for script to load if not already
        let timer: ReturnType<typeof setInterval>

        if (window.google) {
            initializeGoogleOneTap()
        } else {
            timer = setInterval(() => {
                if (window.google) {
                    clearInterval(timer)
                    initializeGoogleOneTap()
                }
            }, 500)
        }

        return () => {
            if (timer) clearInterval(timer)
            window.google?.accounts?.id?.cancel()
        }

    }, [navigate])

    return <div id="google-one-tap-container" style={{ display: 'none' }} />
}

export default GoogleOneTap
