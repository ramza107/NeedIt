'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/utils';
import type { Message, Profile } from '@/types/database';
import { Send, Paperclip } from 'lucide-react';

export function ChatPanel({
  orderId,
  currentUserId,
  participants,
}: {
  orderId: string;
  currentUserId: string;
  participants: Record<string, Profile>;
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });

    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles(*)')
            .eq('id', payload.new.id)
            .single();
          if (data) setMessages((prev) => [...prev, data as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);

    await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: currentUserId,
      content: content.trim(),
    });

    setContent('');
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[500px] rounded-2xl border border-stone-200 bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const sender = msg.sender || participants[msg.sender_id];
          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''} ${msg.is_system ? 'justify-center' : ''}`}
            >
              {msg.is_system ? (
                <div className="rounded-full bg-stone-100 px-4 py-1.5 text-xs text-stone-500">
                  {msg.content}
                </div>
              ) : (
                <>
                  {!isOwn && sender && (
                    <Avatar src={sender.avatar_url} name={sender.full_name} size="sm" />
                  )}
                  <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm ${
                        isOwn
                          ? 'bg-amber-600 text-white rounded-br-md'
                          : 'bg-stone-100 text-stone-800 rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{formatRelativeTime(msg.created_at)}</p>
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-stone-200 p-3 flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="sm" loading={sending} disabled={!content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
