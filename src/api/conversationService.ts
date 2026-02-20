import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '../config/constants';
import type { Conversation, Message, PaginatedResponse } from '../types';

export const conversationService = {
  async getConversations(
    page: number,
    limit: number,
    userId?: string
  ): Promise<PaginatedResponse<Conversation>> {
    return httpClient.get<PaginatedResponse<Conversation>>(API_ENDPOINTS.ADMIN.CONVERSATIONS, {
      page,
      limit,
      userId,
    });
  },

  async getConversationMessages(
    conversationId: string,
    page: number,
    limit: number
  ): Promise<PaginatedResponse<Message>> {
    return httpClient.get<PaginatedResponse<Message>>(
      API_ENDPOINTS.ADMIN.CONVERSATION_MESSAGES(conversationId),
      { page, limit }
    );
  },
};
