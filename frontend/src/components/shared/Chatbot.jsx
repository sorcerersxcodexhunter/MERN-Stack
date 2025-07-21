
import { ChatBotWidget } from "chatbot-widget-ui";
import { useState } from "react";
import chatIcon from "../../assets/ChatBotCharacter.png";
import axios from "axios";
import { user_api_key } from "./util";

function Chatbot() {
    const [messages, setMessages] = useState([]);

    const customApiCall = async (message) => {
        try {
            const payload = {
                message: `You are a friendly AI assistant and student career guide. Your job is to help students with career advice, resolve doubts, and provide guidance on jobs, internships, skills, and personal growth. Respond in a dynamic, conversational style.\n\nStudent: ${message}`,
                userContext: {
                    userId: null,
                    currentPage: window.location.pathname
                },
                conversationHistory: messages.slice(-5)
            };
            const resp = await axios.post(`${user_api_key}/external/chat`, payload, {
                headers: { "Content-Type": "application/json" }
            });
            const data = resp.data;
            if (data.success && data.content) {
                return data.content;
            } else if (data.error) {
                return `I'm having trouble right now: ${data.error}`;
            } else {
                return "I'm having trouble understanding. Could you rephrase that?";
            }
        } catch (err) {
            return `Connection error: ${err.message}. Please check if the server is running.`;
        }
    };

    const handleBotResponse = (response) => {
        setMessages(prev => [...prev, { role: "assistant", content: response }]);
    };

    const handleNewMessage = (msg) => {
        setMessages(prev => [...prev, msg]);
    };

    return (
            <>
            <div></div>
            <div style={{ 
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                pointerEvents: 'auto'
            }}>
                <ChatBotWidget
                    callApi={customApiCall}
                    onBotResponse={handleBotResponse}
                    handleNewMessage={handleNewMessage}
                    messages={messages}
                    primaryColor="#3498db"
                    inputMsgPlaceholder="Ask me about jobs, careers, or resume tips..."
                    chatbotName="JobBuddy"
                    isTypingMessage="Thinking..."
                    IncommingErrMsg="Oops! Try again."
                    chatIcon={<img src={chatIcon} alt="Job Assistant" style={{ width: 55, height: 55 }} />}
                    botIcon={<div style={{ 
                        background: '#3498db', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '32px', 
                        height: '32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>JB</div>}
                    botFontStyle={{ fontFamily: "Arial", fontSize: "14px", color: "#333" }}
                    typingFontStyle={{ fontStyle: "italic", fontSize: "12px", color: "#888" }}
                    useInnerHTML={false}
                />
            </div>
        </>
        
    );
}

export default Chatbot
