import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sendMessage } from '../services/aiService'
import StarRating from '../components/StarRating'
import { useChat } from '../contexts/ChatContext'
import { useToast } from '../contexts/ToastContext'

const QUICK_ACTIONS = [
  'Find dinner tonight',
  'Best rated near me',
  'Vegan options',
  'Something romantic',
  'Family-friendly places',
]

function formatAssistantText(text) {
  return (text || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
}

export default function ChatPage() {
  const { messages, setMessages, resetChat } = useChat()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const { showToast } = useToast()

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
      showToast('AI chat failed. Please try again.', 'error')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', restaurants: [] },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">AI Restaurant Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">Your chat follows you across pages and keeps the conversation context alive.</p>
        </div>
        <button onClick={resetChat} className="btn-secondary text-sm">
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 rounded-3xl border border-gray-200 bg-[radial-gradient(circle_at_top_right,rgba(225,81,95,0.12),transparent_40%),linear-gradient(to_bottom,#fff,#f8fafc)] p-4 pb-4 shadow-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[linear-gradient(135deg,#e1515f,#f77f00)] text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.role === 'assistant' ? formatAssistantText(msg.content) : msg.content}
              </div>

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
                        {r.reason && <p className="text-xs text-[#e1515f] mt-1 italic">{r.reason}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

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

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 my-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => handleSend(a)}
              className="text-xs px-3 py-1.5 rounded-full border border-[#e1515f] text-[#e1515f] hover:bg-[#e1515f] hover:text-white transition-colors"
            >
              {a}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Ask me anything about restaurants, favorites, or review help..."
          className="input flex-1 min-h-[84px] resize-none"
          disabled={loading}
          aria-label="Chat input"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="btn-primary px-5 self-end"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  )
}
