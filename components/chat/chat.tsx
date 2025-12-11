import { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SmsIcon from '@mui/icons-material/Sms';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getChatResponse } from '@/actions/chat.action';
import './chat.css';

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date()); // 오늘 날짜
  const now = new Date().toLocaleTimeString(); // 현재 시간
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `안녕하세요👋 너무 반가워요🤗 이든의 챗봇 놀이터입니다! 오늘은 ${formattedDate}에요! 무엇을 도와드릴까요?`,
      time: now,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpasking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  // 채팅창 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // 서버 API 호출
  }, []);

  // handleSend() 내부에서 요청하는 부분을 수정
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input, time: now };
    setMessages((prev) => [...prev, userMessage]);

    setInput('');
    setIsLoading(true);
    setIsSpeaking(true);

    try {
      const responseData = await getChatResponse(messages, input);
      const reply = responseData.choices[0].message.content;
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: reply, time: now },
      ]);
    } catch (err) {
      console.error('API 요청 실패:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '오류가 발생했습니다.', time: now },
      ]);
    } finally {
      setIsLoading(false);
      setIsSpeaking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={`container ${isChatOpen ? `show-chatbot` : ''}`}>
      {/* 챗봇 열기/닫기 버튼 */}
      <button
        id="chatbotToggler"
        onClick={() => setIsChatOpen((prev) => !prev)}
        title={isChatOpen ? '챗봇 닫기' : '챗봇 열기'}
      >
        <SmsIcon />
        <CloseIcon />
      </button>

      {/* 채팅창 */}
      <div
        className={`chat-container ${isChatOpen ? 'open' : 'closed'}`}
      >
        <div className="chat-header">
          <h1>Chatbot Playground</h1>
          <button
            className="haader-toggle-button"
            onClick={() => setIsChatOpen((prev) => !prev)}
          >
            <KeyboardArrowDownIcon />
          </button>
        </div>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === 'user' ? 'user' : 'bot'
              }`}
            >
              {/* 봇 메시지일때 항상 로봇 아이콘 노출 */}
              {msg.sender === 'bot' && (
                <div className="bot-icon">
                  <SmartToyIcon />
                </div>
              )}
              <div className="msg-box">
                <div className="text">{msg.text}</div>
                <div className="time" suppressHydrationWarning>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          {/* 로딩 상태일 때 메시지 보여주기 */}
          {isLoading && (
            <div className="message bot">
              <div className="bot-icon">
                <SmartToyIcon />
              </div>
              <div className="text">로딩중입니다...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* 입력창 */}
        <div className="chat-input">
          <form
            action="#"
            className="chat-form"
            onSubmit={handleSend}
          >
            <input
              type="text"
              placeholder={
                isLoading
                  ? '챗봇이 대답하는 중이에요...'
                  : '메시지를 입력해주세요...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="message-input"
              required
            />
            {input.trim() && !isLoading && (
              <button className="send-button">
                <SendIcon />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
