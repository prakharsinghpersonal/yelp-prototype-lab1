/**
 * Chat page - AI restaurant recommendation assistant
 */
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sendMessage } from '../services/aiService'
import StarRating from '../components/StarRating'

const QUICK_ACTIONS = [
  'Find dinner tonight',
  'Best rated near me',
  'Vegan options',
  'Something romantic',
  'Family-friendly places',
]

export default function ChatPage() {
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-brand-dark">AI Restaurant Assistant</h1>
        <button onClick={handleNewChat} className="btn-secondary text-sm">
          New Chat
        </button>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-brand-teal text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
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
                      className="card p-3 flex gap-3 hover:shadow-md transition-shadow block"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        🍽️
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{r.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <StarRating rating={r.avg_rating || 0} size="sm" />
                          <span className="text-xs text-gray-500">{r.price_tier}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{r.cuisine_type} · {r.city}</p>
                        {r.reason && <p className="text-xs text-brand-teal mt-1 italic">"{r.reason}"</p>}
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
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a}
              onClick={() => handleSend(a)}
              className="text-xs px-3 py-1.5 rounded-full border border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white transition-colors"
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask me anything about restaurants..."
          className="input flex-1"
          disabled={loading}
          aria-label="Chat input"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="btn-primary px-5"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  )
}
