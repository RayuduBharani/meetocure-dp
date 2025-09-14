/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import { Paperclip, Mic, Send } from "lucide-react";

// Message bubble
const Message = ({ content, timestamp, isUser, isVoice, audioUrl, sources }) => {
    const audioRef = useRef(null);

	useEffect(() => {
		if (isVoice && audioRef.current) {
			audioRef.current.load(); // Ensure audio is properly loaded
		}
	}, [isVoice, audioUrl]);

	const handleAudioError = (e) => {
		console.error('Audio playback error:', e);
		const audioElement = e.target;
		audioElement.parentElement.innerHTML = 'Error playing voice message';
	};

	return (
		<div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-md px-4 py-3 rounded-2xl ${
					isUser ? "bg-[#0A4D68] text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
				}`}
			>
				{isVoice ? (
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<span role="img" aria-label="microphone" className="text-sm">🎤</span>
							<p className="text-sm font-medium">Voice Message</p>
						</div>
						<div className="bg-black/5 rounded-lg p-1">
							<audio 
								ref={audioRef}
								controls 
								className="w-full min-w-[300px]"
								preload="metadata"
								onError={handleAudioError}
							>
								<source src={audioUrl} type="audio/webm" />
								<p>Your browser does not support audio playback.</p>
							</audio>
						</div>
					</div>
				) : (
					<p className="text-sm whitespace-pre-wrap break-words">{content}</p>
				)}
				<p className={`text-xs mt-1 ${isUser ? "text-[#a7d0e8]" : "text-gray-500"}`}>{timestamp}</p>
				{sources && sources.length > 0 && (
					<div className="mt-2 text-xs text-gray-500">
						Sources: {sources.join(", ")}
					</div>
				)}
			</div>
		</div>
	);
};

// Typing indicator
const TypingIndicator = () => (
	<div className="flex items-center gap-2 mb-4">
		<div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
			<div className="flex items-center gap-1">
				<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
				<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
				<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
			</div>
		</div>
	</div>
);

// Input area with file upload, send, and voice
const MessageInput = ({ value, onChange, onSend, onFileUpload, onVoiceInput, isListening, recordingDuration, setRecordingDuration }) => {
	const fileInputRef = useRef(null);
	const timerRef = useRef(null);

	useEffect(() => {
		if (isListening) {
			setRecordingDuration(0);
			timerRef.current = setInterval(() => {
				setRecordingDuration(prev => {
					if (prev >= 60) {
						clearInterval(timerRef.current);
						return prev;
					}
					return prev + 1;
				});
			}, 1000);
		} else {
			clearInterval(timerRef.current);
			setRecordingDuration(0);
		}
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isListening, setRecordingDuration]);

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<div className="bg-white border-t border-gray-200 p-4">
			<div className="flex flex-col gap-2">
				{isListening && (
					<div className="flex items-center justify-center gap-2">
						<div className="flex items-center px-3 py-1 bg-red-50 rounded-full shadow-sm">
							<div className="relative">
								<div className="w-2 h-2 bg-red-500 rounded-full"/>
								<div className="w-2 h-2 bg-red-500 rounded-full absolute top-0 left-0 animate-ping"/>
							</div>
							<span className="text-red-500 text-sm font-medium ml-2">
								Recording in progress... {formatTime(recordingDuration)}
							</span>
							<span className="text-gray-500 text-xs ml-2">
								(click mic to stop)
							</span>
						</div>
					</div>
				)}
				<div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
					<button 
						className="text-gray-400 hover:text-gray-600 relative group" 
						onClick={() => fileInputRef.current.click()}
						disabled={isListening}
					>
						<Paperclip className="w-5 h-5" />
						<input 
							ref={fileInputRef} 
							type="file" 
							className="hidden" 
							onChange={onFileUpload}
							accept="image/*,.pdf,.doc,.docx"
						/>
					</button>
					<input
						type="text"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder={isListening ? "Recording voice message..." : "Type a message..."}
						className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
						disabled={isListening}
					/>
					<button 
						onClick={onVoiceInput}
						className={`relative ${isListening ? "text-red-500" : "text-gray-400"} 
							hover:text-gray-600 transition-colors duration-200`}
						title={isListening ? "Stop recording" : "Start voice message"}
					>
						<Mic className="w-5 h-5" />
						{isListening && (
							<div className="absolute inset-0 bg-red-100 rounded-full -z-10 animate-pulse" />
						)}
					</button>
					<button 
						onClick={onSend} 
						disabled={isListening || (!value && !isListening)}
						className={`bg-[#0A4D68] text-white rounded-full p-2 
							transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
							${!isListening && value ? 'hover:bg-[#083952]' : ''}`}
					>
						<Send className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
};

// Chat interface with voice interaction
const Chatpage2 = ({ patientId, activeConversation, onSaveConversation }) => {
	const initialMessages = useMemo(() => activeConversation?.messages || [
		{
			id: "system-1",
			content: "Hi there! I'm your medical assistant. How can I help you today?",
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			isUser: false,
		},
	], [activeConversation?.messages]);
	const [messages, setMessages] = useState(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const messagesEndRef = useRef(null);
	const API_BASE = import.meta.env.VITE_BACKEND_URL;

	useEffect(() => {
		setMessages(activeConversation?.messages || initialMessages);
		setInputValue("");
	}, [activeConversation, initialMessages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Voice recording state
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState(null);
	const mediaRecorderRef = useRef(null);
	const chunksRef = useRef([]);
	const [recordingDuration, setRecordingDuration] = useState(0);

	// Voice recording state
	const [isRecordingError, setIsRecordingError] = useState(false);
	const recordingTimeoutRef = useRef(null);

	// Handle voice recording
	const handleVoiceInput = async () => {
		if (isListening) {
			// Stop recording
			try {
				if (mediaRecorderRef.current) {
					mediaRecorderRef.current.stop();
					setIsListening(false);
					setIsRecording(false);
					if (recordingTimeoutRef.current) {
						clearTimeout(recordingTimeoutRef.current);
					}
				}
			} catch (err) {
				console.error('Error stopping recording:', err);
				setIsRecordingError(true);
			}
			return;
		}

		try {
			// Request microphone permission and start recording
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			
			// Create media recorder
			const recorder = new MediaRecorder(stream);
			mediaRecorderRef.current = recorder;
			chunksRef.current = [];

			// Handle data chunks
			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
				}
			};

			// Handle recording stop
			recorder.onstop = async () => {
				// Create blob from chunks
				const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
				const url = URL.createObjectURL(blob);
				
				// Log voice recording details
				// console.log('Voice Recording Details:', {
				// 	timestamp: new Date().toISOString(),
				// 	duration: recordingDuration,
				// 	blobSize: blob.size,
				// 	blobType: blob.type,
				// 	chunks: chunksRef.current.length,
				// 	url: url
				// });

				// Add voice message to chat
				const userMessage = {
					id: Date.now().toString(),
					content: "🎤 Voice Message",
					timestamp: new Date().toLocaleTimeString(),
					isUser: true,
					isVoice: true,
					audioUrl: url
				};

				setMessages(prev => [...prev, userMessage]);
				setIsTyping(true);

				try {
					// Create form data
					const formData = new FormData();
					// Convert blob to file to ensure proper upload
					const audioFile = new File([blob], 'voiceMessage.webm', { type: 'audio/webm' });
					formData.append('audio', audioFile);
					formData.append('patientId', patientId);

					// Send to backend
					const response = await axios.post(
						`${API_BASE}/api/chat/voice`,
						formData,
						{
							headers: {
								'Accept': 'application/json',
							},
							withCredentials: true
						}
					);
				

					// Add AI response to chat
					const aiResponse = {
						id: Date.now().toString() + '-ai',
						content: response.data.answer || "Sorry, I couldn't process that voice message.",
						timestamp: new Date().toLocaleTimeString(),
						isUser: false,
					};

					setMessages(prev => {
					    const updatedMessages = [...prev, aiResponse];
					    
					    // Save conversation if callback exists
					    if (onSaveConversation && patientId) {
					        const convId = activeConversation?.id || `conv_${Date.now()}`;
					        onSaveConversation({
					            id: convId,
					            title: "Voice Chat",
					            lastMessage: response.data.answer || "Voice Message",
					            timestamp: Date.now(),
					            messages: updatedMessages
					        });
					    }
					    
					    return updatedMessages;
					});
				} catch (error) {
					console.error('Error processing voice message:', error);
					const errorMessage = {
						id: Date.now().toString() + '-error',
						content: "Sorry, I couldn't process that voice message. Please try again.",
						timestamp: new Date().toLocaleTimeString(),
						isUser: false,
					};
					setMessages(prev => [...prev, errorMessage]);
				} finally {
					setIsTyping(false);
				}

				// Stop all tracks
				stream.getTracks().forEach(track => track.stop());
			};

			// Start recording
			recorder.start();
			setIsRecording(true);
			setIsListening(true);
			setIsRecordingError(false);

			// Auto-stop after 60 seconds
			recordingTimeoutRef.current = setTimeout(() => {
				if (recorder.state === 'recording') {
					recorder.stop();
					setIsRecording(false);
					setIsListening(false);
				}
			}, 60000);

		} catch (err) {
			console.error('Error starting recording:', err);
			setIsRecordingError(true);
			setIsRecording(false);
			setIsListening(false);
			alert('Could not access microphone. Please check permissions and try again.');
		}
	};

	const handleSendMessage = async () => {
		const text = inputValue.trim();
		if (!text) return;
		if (!patientId) {
			const systemMsg = {
				id: Date.now().toString(),
				content: "Please login to start a chat.",
				timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				isUser: false,
			};
			setMessages((prev) => [...prev, systemMsg]);
			setInputValue("");
			return;
		}
		const userMsg = {
			id: Date.now().toString(),
			content: text,
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			isUser: true,
		};
		setMessages((prev) => [...prev, userMsg]);
		setInputValue("");
		setIsTyping(true);
		try {
			const resp = await axios.post(
				`${API_BASE}/api/chat`,
				{ patientId, message: text },
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			const aiText = resp.data?.answer || "No response from assistant.";
			const sources = resp.data?.sources || [];
			const aiReply = {
				id: (Date.now() + 1).toString(),
				content: aiText,
				timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				isUser: false,
				sources,
			};
			setMessages((prev) => {
				const next = [...prev, aiReply];
				if (onSaveConversation && patientId) {
					const convId = activeConversation?.id || `conv_${Date.now()}`;
					onSaveConversation({
						id: convId,
						title: next.find((m) => !m.isUser)?.content?.slice(0, 40) || "Chat",
						lastMessage: aiText,
						timestamp: Date.now(),
						messages: next,
					});
				}
				return next;
			});
			// Message added to chat
		} catch (error) {
			const errReply = {
				id: (Date.now() + 2).toString(),
				content: "Sorry, I couldn't reach the assistant. Please try again later.",
				timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				isUser: false,
			};
			setMessages((prev) => [...prev, errReply]);
			// Error message added to chat
		} finally {
			setIsTyping(false);
		}
	};

	const handleFileUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const fileMsg = {
			id: Date.now().toString(),
			content: `📎 File uploaded: ${file.name}`,
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			isUser: true,
		};
		setMessages((prev) => [...prev, fileMsg]);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto p-4">
				{messages.map((msg) => (
					<Message
						key={msg.id}
						content={msg.content}
						timestamp={msg.timestamp}
						isUser={msg.isUser}
						isVoice={msg.isVoice}
						audioUrl={msg.audioUrl}
						sources={msg.sources}
					/>
				))}
				{isTyping && <TypingIndicator />}
				<div ref={messagesEndRef} />
			</div>
			<MessageInput
				value={inputValue}
				onChange={setInputValue}
				onSend={handleSendMessage}
				onFileUpload={handleFileUpload}
				onVoiceInput={handleVoiceInput}
				isListening={isListening}
				recordingDuration={recordingDuration}
				setRecordingDuration={setRecordingDuration}
			/>
		</div>
	);
};

export default Chatpage2;
