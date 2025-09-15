import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')  # Telugu output fix

from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
import os
from dotenv import load_dotenv
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.memory import ConversationBufferMemory
from langchain_together import ChatTogether
from langchain_community.vectorstores import Chroma
from langdetect import detect
from langchain_core.messages import HumanMessage, SystemMessage
import re

class MedicalAssistant:
    def __init__(self):
        """Initialize the Medical Assistant with all required components"""
        # Load environment variables
        load_dotenv()
        self.TOGETHER_API_KEY = os.environ.get('TOGETHER_API_KEY')
        
        # Initialize components
        self._setup_vectorstore()   # Only loads/creates once
        self._setup_llms()
        self._setup_memory()
        
        # Telugu transliteration patterns
        self.telugu_patterns = [
            r'\b(ela|ela unnav|em cheyali|em chesav|baagunnava|eppudu|ekkada|entha|enduku)\b',
            r'\b(nenu|meeru|memu|vaaru|iddaru|mana|mi|na)\b',
            r'\b(cheppu|cheppandi|help|kavali|undi|ledhu|avunu|kadhu)\b'
        ]
    
    def _load_documents(self):
        """Load and process the medical encyclopedia"""
        document = PyMuPDFLoader(file_path=r"A-Z Family Medical Encyclopedia.pdf", mode='single')
        docs = document.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=50,
            length_function=len,
            is_separator_regex=False,
        )

        text_data = [doc.page_content for doc in docs]
        return text_splitter.create_documents(text_data)
    
    def _setup_vectorstore(self):
        """Setup or load vector store for document retrieval"""
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        chroma_db_path = "chroma_db2"

        if os.path.exists(chroma_db_path):
            self.vectorstore = Chroma(
                persist_directory=chroma_db_path,
                embedding_function=embeddings
            )
        else:
            texts = self._load_documents()
            self.vectorstore = Chroma.from_documents(
                texts,
                embeddings,
                persist_directory=chroma_db_path
            )
            self.vectorstore.persist()

        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 5})
    
    def _setup_llms(self):
        """Setup both small & big LLMs"""
        # Large, accurate model for medical Qs
        self.llm_medical = ChatTogether(
            together_api_key=self.TOGETHER_API_KEY,
            model="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
            max_tokens=500
    )
        # Small, fast model for greetings/casual Qs
        self.llm_fast = ChatTogether(
            together_api_key=self.TOGETHER_API_KEY,
            model="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
            max_tokens=200
    )
    
    def _setup_memory(self):
        """Setup conversation memory"""
        message_history = ChatMessageHistory()
        self.memory = ConversationBufferMemory(
            chat_memory=message_history,
            memory_key="chat_history",
            input_key="question",
            output_key="answer",
            return_messages=True,
            human_prefix="Human",
            ai_prefix="AI",
        )
    
    def _detect_language_enhanced(self, text):
        """Enhanced language detection including transliterated Telugu"""
        try:
            detected = detect(text)
            if detected == 'te':
                return 'te'
        except:
            pass
        
        text_lower = text.lower()
        for pattern in self.telugu_patterns:
            if re.search(pattern, text_lower):
                return 'te_transliterated'
        
        return 'en'
    
    def _is_greeting_or_casual(self, text):
        """Check if the input is a greeting or casual conversation"""
        casual_patterns = [
            r'\b(hi|hello|hey|hola|namaste|vanakkam)\b',
            r'\b(how are you|how r u|whats up|sup|wassup)\b',
            r'\b(good morning|good evening|good afternoon)\b',
            r'\b(ela unnav|ela unnaav|baagunnava|ela undi)\b',
            r'\b(thank you|thanks|bye|goodbye|see you)\b'
        ]
        
        text_lower = text.lower().strip()
        for pattern in casual_patterns:
            if re.search(pattern, text_lower):
                return True
        
        return len(text_lower.split()) <= 3 and any(word in text_lower for word in ['hi', 'hello', 'hey', 'ela'])
    
    def _build_dynamic_prompt(self, user_input, chat_history, context, language):
        """Build language-specific prompts"""
        if language in ['te', 'te_transliterated']:
            return f"""
మీరు ఒక జ్ఞానపూర్వక AI వైద్య సహాయకుడిగా వ్యవహరించాలి. 
ఎల్లప్పుడూ తెలుగు లో స్పష్టంగా మరియు స్నేహపూర్వకంగా సమాధానం ఇవ్వండి. 
సమాధానం చిన్నదిగా (1-2 వాక్యాలు) కానీ అర్థవంతంగా ఉండాలి.

మునుపటి సంభాషణ:
{chat_history}

ప్రశ్న:
{user_input}

పత్రాల నుండి సందర్భ సమాచారం:
{context}

సూచనలు:
- తెలుగు లోనే సమాధానం ఇవ్వాలి.  
- సమాధానం చిన్నదిగా (1-2 వాక్యాలు) కానీ పూర్తిగా ఉండాలి.
- ఎప్పుడూ వాక్యం మధ్యలో ఆపకండి
- క్లిష్ట పదాలను సులభంగా వివరించాలి.  

మీ సమాధానం:
"""
        else:
            return f"""
You are a knowledgeable AI medical assistant. 
Always reply clearly in English. 
Keep the answer short (1-2 sentences) but meaningful.

Previous conversation:
{chat_history}

Question:
{user_input}

Context information from documents:
{context}

Instructions:
- Answer only in English.  
- Keep the answer short (1-2 sentences) but complete. 
- Never stop in the middle of a sentence.
- Explain complex medical terms in simple words.  

Your Answer:
"""
    
    def get_chatbot_response(self, text: str) -> str:
        """Main chatbot function for frontend integration"""
        try:
            language = self._detect_language_enhanced(text)
            
            # For greetings/casual → use fast small model
            if self._is_greeting_or_casual(text):
                result = self.llm_fast.invoke([HumanMessage(content=text)])
                response = result.content
                self.memory.save_context({"question": text}, {"answer": response})
                return response
            
            # For medical questions → use big model + vectorstore
            docs = self.retriever.invoke(text)
            context = "\n\n".join([doc.page_content for doc in docs])
            
            dynamic_prompt = self._build_dynamic_prompt(text, self.memory.buffer_as_str, context, language)

            result = self.llm_medical.invoke([
                SystemMessage(content=dynamic_prompt),
                HumanMessage(content=text)
            ])

            self.memory.save_context({"question": text}, {"answer": result.content})
            return result.content

        except Exception:
            if language in ['te', 'te_transliterated']:
                return "క్షమించండి, మీ ప్రశ్నను ప్రాసెస్ చేయలేకపోయాను. మరోసారి ప్రయత్నించండి."
            else:
                return "I'm sorry, I couldn't process your request. Please try again."
    
    def clear_conversation_history(self):
        self.memory.clear()
    
    def get_conversation_history(self):
        return self.memory.buffer_as_str

# Global instance
medical_assistant = None

def initialize_medical_assistant():
    global medical_assistant
    if medical_assistant is None:
        medical_assistant = MedicalAssistant()
    return medical_assistant

def get_chatbot_response(text: str) -> str:
    global medical_assistant
    if medical_assistant is None:
        medical_assistant = initialize_medical_assistant()
    return medical_assistant.get_chatbot_response(text)

def clear_chat_history():
    global medical_assistant
    if medical_assistant:
        medical_assistant.clear_conversation_history()
  
        
if __name__ == "__main__":
    assistant = initialize_medical_assistant()

    print("Medical Assistant is ready! Type your question (or 'quit' to exit):")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["quit", "exit", "bye"]:
            print("Assistant: Goodbye! Stay healthy.")
            break
        response = assistant.get_chatbot_response(user_input)
        print("Assistant:", response)
