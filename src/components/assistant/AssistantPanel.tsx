import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { ListChecks, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolPart,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "flow-board-assistant-conversation";

const SUGGESTIONS = [
  "Summarise what's in progress",
  "Add a high priority task: prepare launch deck",
  "Move the budget proposal to In Progress",
];

export function AssistantPanel() {
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: "flow-board-assistant",
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (chatError) => toast.error(chatError.message || "The assistant hit an error"),
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      textareaRef.current?.focus();
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UIMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
    textareaRef.current?.focus();
  }, [setMessages]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    if (status === "streaming" || status === "submitted") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, status, hydrated]);

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value });
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <aside className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-border/60 bg-surface">
      <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <img src={logo} alt="Flow assistant" width={32} height={32} className="h-8 w-8" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold">Flow assistant</h2>
          <p className="text-[11px] text-muted-foreground">Can read and edit your board</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Clear conversation"
          onClick={() => {
            setMessages([]);
            if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
            textareaRef.current?.focus();
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </header>

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-4 px-3 py-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<ListChecks className="h-6 w-6 text-primary" />}
              title="Ask me to run the board"
              description="I can add, move, edit and delete tasks, or summarise where things stand."
            >
              <div className="mt-4 flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-lg border border-border/70 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent
                  className={
                    message.role === "assistant"
                      ? "bg-transparent px-0 text-foreground"
                      : "bg-primary text-primary-foreground"
                  }
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return <MessageResponse key={index}>{part.text}</MessageResponse>;
                    }
                    if (part.type.startsWith("tool-")) {
                      const toolPart = part as ToolUIPart;
                      return (
                        <Tool key={index} defaultOpen={false} className="my-1">
                          <ToolHeader type={toolPart.type} state={toolPart.state} />
                          <ToolContent>
                            <ToolInput input={toolPart.input} />
                            <ToolOutput
                              output={toolPart.output ?? null}
                              errorText={toolPart.errorText ?? ""}
                            />
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}

          {status === "submitted" ? <Shimmer className="text-sm">Thinking...</Shimmer> : null}
          {error ? (
            <p className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">
              {error.message}
            </p>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/60 p-3">
        <PromptInput
          onSubmit={(_message, event) => {
            event.preventDefault();
            send(input);
          }}
        >
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Flow to update the board..."
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!input.trim() && !busy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </aside>
  );
}
