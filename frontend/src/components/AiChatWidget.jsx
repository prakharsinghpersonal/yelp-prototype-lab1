import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sendMessage } from '../services/aiService'
import { isLoggedIn } from '../services/authService'
import StarRating from './StarRating'
import { useChat } from '../contexts/ChatContext'
import { useToast } from '../contexts/ToastContext'

const QUICK_ACTIONS = [
  'Find dinner tonight',
  'Best rated near me',
  'Vegan options',
]

function formatAssistantText(text) {
  return (text || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, setMessages, resetChat } = useChat()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const { showToast } = useToast()

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
      showToast('AI chat failed. Please try again.', 'error')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', restaurants: [] },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    resetChat()
    setInput('')
  }

  if (!isLoggedIn()) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex h-[600px] max-h-[80vh] w-[350px] flex-col overflow-hidden rounded-[28px] border border-white/50 bg-white shadow-2xl sm:w-[420px]">
          <div className="flex items-center justify-between bg-[linear-gradient(135deg,#e1515f,#f77f00)] p-4 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xl shadow-sm">✨</span>
              Concierge AI
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={handleNewChat} className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30">
                Reset
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-100">✕</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(225,81,95,0.12),transparent_40%),linear-gradient(to_bottom,#fff,#f8fafc)] p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end'}`}>
                {msg.role === 'assistant' && (
                  <div className="mb-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e1515f,#f77f00)] text-[14px] text-white shadow-sm">
                    ✨
                  </div>
                )}
                <div className={`flex max-w-[84%] flex-col ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-[linear-gradient(135deg,#e1515f,#f77f00)] text-white'
                        : 'rounded-bl-sm border border-gray-200 bg-white text-gray-800'
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
                          className="block rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="flex gap-3">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
                              🍽️
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">{r.name}</p>
                              <div className="mt-1 flex items-center gap-1">
                                <StarRating rating={r.avg_rating || 0} size="xs" />
                                <span className="text-[10px] text-gray-500">{r.price_tier}</span>
                              </div>
                              <p className="mt-1 truncate text-[11px] text-gray-500">{r.cuisine_type} · {r.city}</p>
                              {r.reason && <p className="mt-1 line-clamp-2 text-[11px] italic text-[#e1515f]">{r.reason}</p>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2 items-end">
                <div className="mb-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e1515f,#f77f00)] text-[14px] text-white shadow-sm">
                  ✨
                </div>
                <div className="mb-1 rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3 py-2 shadow-sm">
                  <div className="flex h-4 items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            {messages.length <= 1 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleSend(a)}
                    className="rounded-full border border-[#e1515f] px-2 py-1 text-[10px] font-semibold text-[#e1515f] transition-colors hover:bg-[#e1515f] hover:text-white"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask for suggestions, favorites, or review help..."
                className="input min-h-[72px] resize-none text-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="btn-primary w-full py-2 text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-200 z-50 ${
          isOpen ? 'bg-gray-800 hover:bg-gray-900' : 'bg-[linear-gradient(135deg,#e1515f,#f77f00)] hover:scale-105'
        }`}
        aria-label="Toggle AI Chat"
      >
        <span className="text-3xl">{isOpen ? '✕' : '✨'}</span>
      </button>
    </div>
  )
}
