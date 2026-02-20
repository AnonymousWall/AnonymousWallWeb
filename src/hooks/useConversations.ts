import { useQuery } from '@tanstack/react-query';
import { conversationService } from '../api/conversationService';
import { QUERY_KEYS } from '../config/constants';
import type { Conversation, Message, PaginatedResponse } from '../types';

export const useConversations = (page: number, limit: number, userId?: string) => {
  return useQuery<PaginatedResponse<Conversation>, Error>({
    queryKey: [QUERY_KEYS.CONVERSATIONS, page, limit, userId],
    queryFn: () => conversationService.getConversations(page, limit, userId),
  });
};

export const useConversationMessages = (
  conversationId: string,
  page: number,
  limit: number,
  enabled = true
) => {
  return useQuery<PaginatedResponse<Message>, Error>({
    queryKey: [QUERY_KEYS.CONVERSATION_MESSAGES, conversationId, page, limit],
    queryFn: () => conversationService.getConversationMessages(conversationId, page, limit),
    enabled,
  });
};
