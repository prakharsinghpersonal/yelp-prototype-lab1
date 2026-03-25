import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { sendMessage } from '../services/aiService'
import { isLoggedIn } from '../services/authService'
import StarRating from './StarRating'

const QUICK_ACTIONS = [
  'Find dinner tonight',
  'Best rated near me',
  'Vegan options',
]

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your restaurant assistant. Tell me what you're looking for and I'll find the perfect spot for you.",
      restaurants: [],
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const location = useLocation()



  // Auto-scroll when chat opens or new message arrives
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const conversationHistory = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const handleSend = async (query) => {
    const text = query || input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text, restaurants: [] }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await sendMessage(text, conversationHistory)
      const data = res.data
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || data.response || 'Here are some recommendations:',
          restaurants: data.restaurants || [],
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', restaurants: [] },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your restaurant assistant. Tell me what you're looking for and I'll find the perfect spot for you.",
        restaurants: [],
      },
    ])
    setInput('')
  }

  if (!isLoggedIn()) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col overflow-hidden mb-4 transition-all duration-300">
          {/* Header */}
          <div className="bg-brand-primary text-white p-4 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-sm">🤖</span> AI Assistant
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleNewChat}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-[14px] flex-shrink-0 shadow-sm mb-1">
                    🤖
                  </div>
                )}
                <div className={`max-w-[82%] ${msg.role === 'user' ? 'order-2' : 'order-1'} flex flex-col`}>
                  {/* Bubble */}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-brand-primary text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Restaurant cards */}
                  {msg.restaurants?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.restaurants.map((r) => (
                        <Link
                          key={r.id}
                          to={`/restaurants/${r.id}`}
                          onClick={() => setIsOpen(false)} // Close chat when navigating
                          className="bg-white p-2 rounded-lg border border-gray-200 flex gap-2 hover:shadow-md transition-shadow block"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-lg flex-shrink-0">
                            🍽️
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs truncate leading-tight">{r.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <StarRating rating={r.avg_rating || 0} size="xs" />
                              <span className="text-[10px] text-gray-500">{r.price_tier}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{r.cuisine_type} · {r.city}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="flex justify-start gap-2 items-end">
                <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-[14px] flex-shrink-0 shadow-sm mb-1">
                  🤖
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm mb-1">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
             {/* Quick actions if empty chat */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => handleSend(a)}
                    className="text-[10px] px-2 py-1 rounded-full border border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask for suggestions..."
                className="input text-sm py-2 px-3 w-full"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="btn-primary py-2 w-full text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-gray-800 hover:bg-gray-900' : 'bg-brand-primary hover:bg-brand-dark hover:scale-105'
        } text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-200 z-50`}
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <span className="text-2xl">✕</span>
        ) : (
          <span className="text-3xl">✨</span>
        )}
      </button>
    </div>
  )
}
