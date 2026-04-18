import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic, MicOff } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
    const { token } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ text: "नमस्ते! I am e-PC. How can I help you regarding Panchayat services today?", sender: "ai" }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [interimFeedback, setInterimFeedback] = useState("");
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, interimFeedback, loading]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'hi-IN';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setInput(prev => prev + " " + finalTranscript);
                }
                setInterimFeedback(interimTranscript);
            };

            recognitionRef.current.onerror = (e) => {
                console.error("Speech recognition error", e);
                setIsListening(false);
                setInterimFeedback("");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                setInterimFeedback("");
            };
        }
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        };
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setInterimFeedback("");
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) { }
        }
    };

    const handleSend = async () => {
        const messageToSend = input.trim();
        if (!messageToSend || !token) return;

        if (isListening) {
            toggleListening();
        }

        const newMessages = [...messages, { text: messageToSend, sender: "user" }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/chat', { prompt: messageToSend }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages([...newMessages, { text: res.data.response, sender: "ai" }]);
        } catch (error) {
            setMessages([...newMessages, { text: "Sorry, I encountered an error. Please try again.", sender: "ai" }]);
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:scale-105 transition-all z-40"
            >
                <MessageSquare className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col h-[500px] border border-gray-100"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                            <div className="font-semibold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                e-PC Assistant
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap chat-bubble ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                                        {m.sender === 'ai' ? (
                                            <div dangerouslySetInnerHTML={{ __html: m.text.replace(/<b>(.*?)<\/b>/g, '<strong style="font-weight: 700; font-size: 1.1em;">$1</strong>') }} />
                                        ) : (
                                            m.text
                                        )}
                                    </div>
                                </div>
                            ))}
                            {interimFeedback && (
                                <div className="flex justify-end">
                                    <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-blue-400/20 text-blue-800 rounded-tr-sm shadow-sm italic animate-pulse">
                                        {interimFeedback}...
                                    </div>
                                </div>
                            )}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                            <button
                                onClick={toggleListening}
                                className={`p-2 rounded-full transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                title="Click to speak (Hindi/English)"
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type or speak your message..."
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || (!input.trim() && !isListening)}
                                className="p-2 rounded-full bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;