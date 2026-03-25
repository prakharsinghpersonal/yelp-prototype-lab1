/**
 * AI Chat service - Restaurant recommendations via AI assistant
 */
import api from './api'

export const sendMessage = (message, conversationHistory) =>
  api.post('/ai-assistant/chat', {
    message,
    conversation_history: conversationHistory,
  })
