import os
import requests
import logging

logger = logging.getLogger(__name__)

class GroqAIService:
    """
    🚀 High-performance LLM Service using Groq Cloud API.
    Utilizes Llama 3 for extreme reasoning and natural language processing.
    Modeled directly after Al Shifaa Hospital Management System's AI service.
    """
    
    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
    AUDIO_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
    DEFAULT_MODEL = "llama-3.3-70b-versatile"

    def __init__(self, model=None):
        # Retrieve the API key from environment variables (loaded via dotenv in config)
        self.api_key = os.environ.get("GROQ_API_KEY")
        self.model = model or self.DEFAULT_MODEL
        
        if not self.api_key:
            logger.warning("GROQ_API_KEY is not configured in environment variables.")

    def generate_response(self, prompt: str, system_prompt: str = None, json_format: bool = False) -> str:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2 if json_format else 0.5,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": False
        }
        
        if json_format:
            payload["response_format"] = {"type": "json_object"}

        try:
            logger.info(f"Dispatching high-fidelity request to Groq Cloud endpoint ({self.model}) [JSON Mode: {json_format}]")
            response = requests.post(self.BASE_URL, headers=headers, json=payload, timeout=20)
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Error communicating with Groq AI core pipeline: {str(e)}")
            raise e

    def transcribe_audio(self, file_bytes: bytes, filename: str) -> str:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured.")

        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        files = {
            "file": (filename, file_bytes, "audio/webm")
        }
        
        payload = {
            "model": "whisper-large-v3",
            "response_format": "json"
        }
        
        try:
            logger.info(f"Dispatching high-fidelity request to Groq Whisper endpoint (whisper-large-v3) for file: {filename}")
            response = requests.post(self.AUDIO_URL, headers=headers, files=files, data=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return result.get("text", "").strip()
        except Exception as e:
            logger.error(f"Error communicating with Groq Whisper audio pipeline: {str(e)}")
            raise e


