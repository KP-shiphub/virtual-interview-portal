import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const [loading, setLoading] =
    useState(true)

  const [profileLoading, setProfileLoading] =
    useState(false)

  const [authInitialized, setAuthInitialized] =
    useState(false)

  async function loadProfile(
    currentUser
  ) {
    if (!currentUser) {
      setProfile(null)
      return null
    }

    setProfileLoading(true)

    try {
      const {
        data,
        error,
      } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email, role, created_at'
        )
        .eq('id', currentUser.id)
        .maybeSingle()

      if (error) {
        console.error(
          'Error loading profile:',
          error
        )

        setProfile(null)

        return null
      }

      setProfile(data)

      return data
    } finally {
      setProfileLoading(false)
    }
  }

  async function refreshProfile() {
    if (!user) {
      setProfile(null)
      return null
    }

    return loadProfile(user)
  }

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession()

        if (!mounted) {
          return
        }

        const currentUser =
          session?.user ?? null

        setUser(currentUser)

        if (currentUser) {
          await loadProfile(
            currentUser
          )
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error(
          'Authentication initialization error:',
          error
        )

        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          setAuthInitialized(true)
        }
      }
    }

    initializeAuth()

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (!mounted) {
            return
          }

          console.log(
            'Auth state changed:',
            event
          )

          const currentUser =
            session?.user ?? null

          setUser(currentUser)

          if (
            event === 'SIGNED_OUT'
          ) {
            setProfile(null)
            setLoading(false)
            return
          }

          if (currentUser) {
            setLoading(true)

            setTimeout(
              async () => {
                if (!mounted) {
                  return
                }

                await loadProfile(
                  currentUser
                )

                if (mounted) {
                  setLoading(false)
                  setAuthInitialized(
                    true
                  )
                }
              },
              0
            )
          } else {
            setProfile(null)
            setLoading(false)
          }
        }
      )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function logout() {
    const {
      error,
    } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    profileLoading,
    authInitialized,
    refreshProfile,
    logout,
  }

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    )
  }

  return context
}