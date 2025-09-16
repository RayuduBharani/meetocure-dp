import sys
import io
import os
import re
from dotenv import load_dotenv
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.memory import ConversationBufferMemory
from langchain_together import ChatTogether
from langchain_core.messages import HumanMessage, SystemMessage
from langdetect import detect, LangDetectException

class MedicalAssistant:
    """A medical assistant chatbot supporting English and Telugu queries."""
    
    CHROMA_DB_PATH = "chroma_db2"
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    MEDICAL_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"
    FAST_MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"
    
    TELUGU_PATTERNS = [
        r'\b(ela|ela unnav|em cheyali|em chesav|baagunnava|eppudu|ekkada|entha|enduku)\b',
        r'\b(nenu|meeru|memu|vaaru|iddaru|mana|mi|na)\b',
        r'\b(cheppu|cheppandi|help|kavali|undi|ledhu|avunu|kadhu)\b'
    ]
    
    CASUAL_PATTERNS = [
        r'\b(hi|hello|hey|hola|namaste|vanakkam)\b',
        r'\b(how are you|how r u|whats up|sup|wassup)\b',
        r'\b(good morning|good evening|good afternoon)\b',
        r'\b(ela unnav|ela unnaav|baagunnava|ela undi)\b',
        r'\b(thank you|thanks|bye|goodbye|see you)\b'
    ]
    
    def __init__(self):
        """Initialize components with lazy loading and environment setup."""
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        load_dotenv()
        self.api_key = os.getenv('TOGETHER_API_KEY')
        self.hf_token = os.getenv('HF_TOKEN')
        if not self.api_key:
            raise ValueError("TOGETHER_API_KEY not found in environment variables.")
        if not self.hf_token:
            raise ValueError("HF_TOKEN not found in environment variables.")

        
        self.vectorstore = None
        self.retriever = None
        self.llm_medical = None
        self.llm_fast = None
        self.memory = None
        self._initialize_components()

    def _initialize_components(self):
        """Initialize vector store, LLMs, and memory."""
        self._setup_vectorstore()
        self._setup_llms()
        self._setup_memory()

    def _load_documents(self):
        """Load and split the medical encyclopedia PDF."""
        loader = PyMuPDFLoader(file_path="A-Z Family Medical Encyclopedia.pdf")
        docs = loader.load()
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=50,
            length_function=len,
            is_separator_regex=False
        )
        return splitter.create_documents([doc.page_content for doc in docs])

    def _setup_vectorstore(self):
        """Set up or load vector store for document retrieval."""
        embeddings = HuggingFaceEmbeddings(model_name=self.EMBEDDING_MODEL, cache_folder = './hf_models', model_kwargs = {'use_auth_token' : self.hf_token})

        
        if os.path.exists(self.CHROMA_DB_PATH):
            self.vectorstore = Chroma(
                persist_directory=self.CHROMA_DB_PATH,
                embedding_function=embeddings
            )
        else:
            texts = self._load_documents()
            self.vectorstore = Chroma.from_documents(
                documents=texts,
                embedding=embeddings,
                persist_directory=self.CHROMA_DB_PATH
            )
        
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 5})

    def _setup_llms(self):
        """Set up large and small LLMs for medical and casual queries."""
        self.llm_medical = ChatTogether(
            together_api_key=self.api_key,
            model=self.MEDICAL_MODEL,
            max_tokens=500
        )
        self.llm_fast = ChatTogether(
            together_api_key=self.api_key,
            model=self.FAST_MODEL,
            max_tokens=200
        )

    def _setup_memory(self):
        """Set up conversation memory."""
        self.memory = ConversationBufferMemory(
            chat_memory=ChatMessageHistory(),
            memory_key="chat_history",
            input_key="question",
            output_key="answer",
            return_messages=True,
            human_prefix="Human",
            ai_prefix="AI"
        )

    def _detect_language(self, text):
        """Detect if input is Telugu (native or transliterated) or English."""
        try:
            if detect(text) == 'te':
                return 'te'
        except LangDetectException:
            pass
        
        text_lower = text.lower()
        for pattern in self.TELUGU_PATTERNS:
            if re.search(pattern, text_lower):
                return 'te_transliterated'
        return 'en'

    def _is_greeting_or_casual(self, text):
        """Identify if input is a greeting or casual query."""
        text_lower = text.lower().strip()
        for pattern in self.CASUAL_PATTERNS:
            if re.search(pattern, text_lower):
                return True
        return len(text_lower.split()) <= 3 and any(word in text_lower for word in ['hi', 'hello', 'hey', 'ela'])

    def _build_prompt(self, user_input, chat_history, context, language):
        """Build dynamic prompt based on language."""
        base_prompt = {
            'te': """
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
""",
            'te_transliterated': """
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
""",
            'en': """
You are a knowledgeable AI medical assistant.
Your name is Meetocure AI Assistant. 
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
        }
        return base_prompt.get(language, base_prompt['en']).format(
            chat_history=chat_history,
            user_input=user_input,
            context=context
        )

    def get_chatbot_response(self, text: str) -> str:
        """Process user input and return appropriate response."""
        try:
            language = self._detect_language(text)
            
            if self._is_greeting_or_casual(text):
                result = self.llm_fast.invoke([HumanMessage(content=text)])
                response = result.content
                self.memory.save_context({"question": text}, {"answer": response})
                return response
            
            docs = self.retriever.invoke(text)
            context = "\n\n".join(doc.page_content for doc in docs)
            prompt = self._build_prompt(text, self.memory.buffer_as_str, context, language)
            
            result = self.llm_medical.invoke([
                SystemMessage(content=prompt),
                HumanMessage(content=text)
            ])
            
            response = result.content
            self.memory.save_context({"question": text}, {"answer": response})
            return response

        except Exception as e:
            error_msg = {
                'te': "క్షమించండి, మీ ప్రశ్నను ప్రాసెస్ చేయలేకపోయాను. మరోసారి ప్రయత్నించండి.",
                'te_transliterated': "క్షమించండి, మీ ప్రశ్నను ప్రాసెస్ చేయలేకపోయాను. మరోసారి ప్రయత్నించండి.",
                'en': f"Sorry, I couldn't process your request due to an error: {str(e)}. Please try again."
            }
            return error_msg.get(language, error_msg['en'])

    def clear_conversation_history(self):
        """Clear conversation history."""
        self.memory.clear()

    def get_conversation_history(self):
        """Return conversation history as a string."""
        return self.memory.buffer_as_str

# Singleton instance
_medical_assistant = None

def initialize_medical_assistant():
    """Initialize or return the singleton MedicalAssistant instance."""
    global _medical_assistant
    if _medical_assistant is None:
        _medical_assistant = MedicalAssistant()
    return _medical_assistant

def get_chatbot_response(text: str) -> str:
    """Global function to get chatbot response."""
    return initialize_medical_assistant().get_chatbot_response(text)

def clear_chat_history():
    """Global function to clear conversation history."""
    if _medical_assistant:
        _medical_assistant.clear_conversation_history()

if __name__ == "__main__":
    assistant = initialize_medical_assistant()
    print("Medical Assistant is ready! Type your question (or 'quit' to exit):")
    while True:
        user_input = input("You: ")
        if user_input.lower() in {"quit", "exit", "bye"}:
            print("Assistant: Goodbye! Stay healthy.")
            break
        response = assistant.get_chatbot_response(user_input)
        print("Assistant:", response)