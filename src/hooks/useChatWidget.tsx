
import React, { createContext, useContext, useState } from 'react';

interface ChatWidgetContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
}

const ChatWidgetContext = createContext<ChatWidgetContextType | undefined>(undefined);

export const ChatWidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <ChatWidgetContext.Provider value={{ isOpen, setIsOpen, openChat, closeChat }}>
      {children}
    </ChatWidgetContext.Provider>
  );
};

export const useChatWidget = () => {
  const context = useContext(ChatWidgetContext);
  if (context === undefined) {
    throw new Error('useChatWidget must be used within a ChatWidgetProvider');
  }
  return context;
};
