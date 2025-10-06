import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { 
            role: 'model', 
            parts: [{ text: "Hello! I'm here to help you with your coding problem. Feel free to ask me anything about the problem, test cases, or starting code." }]
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (isLoading) return; // Prevent multiple submissions
        
        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        
        // Add user message immediately
        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            // Prepare messages for API - include the new user message
            const messagesForApi = [...messages, userMessage];
            
            const response = await axiosClient.post("/ai/chat", {
                messages: messagesForApi,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: response.data.message }] 
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "Sorry, I encountered an error. Please try again." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px] bg-base-100 rounded-lg border">
            {/* Header */}
            <div className="p-4 border-b bg-base-200 rounded-t-lg">
                <h3 className="font-semibold text-lg">AI Assistant</h3>
                <p className="text-sm text-base-content/70">Ask me about the problem</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-image avatar ${msg.role === "user" ? "hidden" : ""}`}>
                            <div className="w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs">AI</span>
                            </div>
                        </div>
                        <div 
                            className={`chat-bubble ${
                                msg.role === "user" 
                                    ? "bg-primary text-primary-content" 
                                    : "bg-base-300 text-base-content"
                            }`}
                        >
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                    <div className="chat chat-start">
                        <div className="chat-image avatar">
                            <div className="w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs">AI</span>
                            </div>
                        </div>
                        <div className="chat-bubble bg-base-300">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-base-content/50 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-base-content/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-sm">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="sticky bottom-0 p-4 bg-base-100 border-t rounded-b-lg"
            >
                <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                        <input 
                            placeholder="Ask me anything about the problem..." 
                            className="input input-bordered w-full pr-10" 
                            {...register("message", { 
                                required: "Message is required", 
                                minLength: {
                                    value: 2,
                                    message: "Message must be at least 2 characters"
                                },
                                maxLength: {
                                    value: 500,
                                    message: "Message must be less than 500 characters"
                                }
                            })}
                            disabled={isLoading}
                        />
                        {errors.message && (
                            <div className="absolute -bottom-6 left-0 text-xs text-error">
                                {errors.message.message}
                            </div>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-square"
                        disabled={isLoading || !!errors.message}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;