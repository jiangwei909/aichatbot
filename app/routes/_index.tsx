import { useState, useRef, useEffect } from "react";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Chatbot" },
    { name: "description", content: "An AI-powered chatbot interface" },
  ];
};

interface Message {
  text: string;
  isUser: boolean;
  id: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = formData.get("message") as string;

  // Mock AI response (replace with actual AI API call in the future)
  const aiResponse = `You said: "${message}". As an AI, I'm here to help!`;

  return { userMessage: message, aiResponse };
}

export default function Index() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const actionData = useActionData<typeof action>();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (actionData?.userMessage && actionData?.aiResponse) {
      setChatHistory((prev) => [
        ...prev,
        { text: actionData.userMessage, isUser: true, id: Date.now().toString() },
        { text: actionData.aiResponse, isUser: false, id: (Date.now() + 1).toString() },
      ]);
    }
  }, [actionData]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (navigation.state === "idle" && formRef.current) {
      formRef.current.reset();
    }
  }, [navigation.state]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
      <header className="bg-white p-4 shadow dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Chatbot</h1>
      </header>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {chatHistory.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[70%] items-start gap-2 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`h-8 w-8 rounded-full ${message.isUser ? 'bg-blue-500' : 'bg-green-500'} flex items-center justify-center text-white flex-shrink-0`}>
                    {message.isUser ? '👤' : '🤖'}
                  </div>
                  <div className={`rounded-lg p-4 ${message.isUser ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'}`}>
                    <p className={`text-sm ${message.isUser ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200'}`}>{message.text}</p>
                    {!message.isUser && (
                      <button
                        onClick={() => copyToClipboard(message.text, message.id)}
                        className="mt-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                        title="Copy to clipboard"
                      >
                        {copiedStates[message.id] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Form ref={formRef} method="post" className="mx-auto flex max-w-3xl gap-2">
            <input
              type="text"
              name="message"
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-200"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "Sending..." : "Send"}
            </button>
          </Form>
        </div>
      </main>
    </div>
  );
}