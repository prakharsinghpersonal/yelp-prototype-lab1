import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'yelpish-chat-state'

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: "Hi! I'm your restaurant assistant. Tell me what you're looking for and I'll help with restaurants, favorites, and reviews.",
    restaurants: [],
  },
]

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES
    } catch {
      return INITIAL_MESSAGES
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const resetChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES)
  }, [])

  const value = useMemo(() => ({ messages, setMessages, resetChat }), [messages, resetChat])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
