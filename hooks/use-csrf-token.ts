"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useCsrfToken() {
    const [csrfToken, setCsrfToken] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch("/api/csrf", { credentials: "include" })
                if (!res.ok) throw new Error(`CSRF fetch failed: ${res.status}`)
                const data = await res.json()
                setCsrfToken(data.token)
            } catch (err) {
                console.error("CSRF fetch error:", err)
                toast({
                    type: "error",
                    title: "Security Error",
                    description: "Failed to initialize CSRF token. Refresh the page.",
                })
            }
        }
        fetchToken()
    }, [toast])

    return {csrfToken,setCsrfToken }
}
