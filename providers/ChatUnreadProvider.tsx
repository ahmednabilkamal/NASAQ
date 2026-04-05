import apiService, { Conversation } from '@/config/apiService';
import { useAuth } from '@/config/authContext';
import { isStylistUser, isStylistVerified } from '@/config/navigationFlow';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

type ChatUnreadContextValue = {
    totalUnread: number;
    refreshChatUnread: () => Promise<void>;
    syncUnreadFromConversations: (conversations: Conversation[]) => void;
};

const defaultChatUnread: ChatUnreadContextValue = {
    totalUnread: 0,
    refreshChatUnread: async () => {},
    syncUnreadFromConversations: () => {},
};

const ChatUnreadContext = createContext<ChatUnreadContextValue>(defaultChatUnread);

function sumUnread(conversations: Conversation[]): number {
    return conversations.reduce((s, c) => s + (Number(c.unread_count) || 0), 0);
}

export function ChatUnreadProvider({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [totalUnread, setTotalUnread] = useState(0);

    const syncUnreadFromConversations = useCallback((conversations: Conversation[]) => {
        setTotalUnread(sumUnread(conversations));
    }, []);

    const refreshChatUnread = useCallback(async () => {
        if (!isAuthenticated || authLoading) {
            setTotalUnread(0);
            return;
        }
        try {
            const stylist = isStylistUser(user) && isStylistVerified(user);
            const res = stylist
                ? await apiService.listStylistConversations({ skipErrorToast: true })
                : await apiService.listConversations({ skipErrorToast: true });
            const list = Array.isArray(res?.data) ? res.data : [];
            setTotalUnread(sumUnread(list));
        } catch {
            setTotalUnread(0);
        }
    }, [isAuthenticated, authLoading, user]);

    useEffect(() => {
        if (!isAuthenticated || authLoading) {
            setTotalUnread(0);
            return;
        }
        void refreshChatUnread();
    }, [isAuthenticated, authLoading, refreshChatUnread]);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active' && isAuthenticated && !authLoading) {
                void refreshChatUnread();
            }
        });
        return () => sub.remove();
    }, [isAuthenticated, authLoading, refreshChatUnread]);

    const value = useMemo(
        () => ({ totalUnread, refreshChatUnread, syncUnreadFromConversations }),
        [totalUnread, refreshChatUnread, syncUnreadFromConversations]
    );

    return <ChatUnreadContext.Provider value={value}>{children}</ChatUnreadContext.Provider>;
}

export function useChatUnread(): ChatUnreadContextValue {
    return useContext(ChatUnreadContext);
}
