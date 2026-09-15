"""AI/Chatbot API integration using OpenRouter."""
import os
import json
import httpx
import logging
import asyncio
import re
from dotenv import load_dotenv

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
# override=False ensures real environment variables (e.g. HF Space secrets)
# always take priority and are never overwritten by a stale .env file
load_dotenv(dotenv_path=env_path, override=False)
logger = logging.getLogger(__name__)

# Load API Keys — os.environ.get() reads the live process environment directly
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

# --- DEBUGGING BLOCK ---
print("\n" + "="*60)
print(f"[DEBUG] Attempting to load .env from: {env_path}")
print(f"[DEBUG] Does that .env file actually exist? {os.path.exists(env_path)}")
print(f"[DEBUG] Gemini API Key loaded into Python memory? {bool(GEMINI_API_KEY)}")
if GEMINI_API_KEY:
    masked_key = GEMINI_API_KEY[:6] + "..." + GEMINI_API_KEY[-4:]
    print(f"[DEBUG] Gemini masked key: {masked_key} (Model: {GEMINI_MODEL})")
print(f"[DEBUG] OpenRouter API Key loaded? {bool(OPENROUTER_API_KEY)}")
print("="*60 + "\n")

# Using OpenRouter as fallback
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

COUNSELLING_SYSTEM_PROMPT = """You are MindHealth, a highly empathetic, natural, and helpful mental health companion.
Your role is to listen and provide supportive conversation.

CRITICAL RULES FOR YOUR PERSONA:
1. ALWAYS act as MindHealth. Never break character.
2. For the first 8-10 interactions, act as a professional counselor conducting a strict clinical intake assessment. You MUST systematically ask questions to uncover all of these categories:
   - Core problem
   - Duration of the issue
   - Impact on sleep/daily life
   - Physical symptoms
   - Severity (1-10 scale)
   - Coping methods
   - Support system available
   - Triggers for the problem
   - Emotions currently felt
   To gather data efficiently, naturally combine 2 related questions into one response (e.g., asking about physical symptoms and sleep together). The full intake MUST be strictly completed within 8 to 10 messages max. Do not rush to give advice. Prioritize gathering this full picture first through natural, empathetic questioning.
3. If the user asks a general question (e.g., "Why were you created?", "What is the weather?", "Can you write code?"), ANSWER IT NATURALLY to the best of your ability without breaking your supportive persona. NEVER just reply "Thank you for sharing this with me. Your feelings are valid." to a question.
4. Your goal is to actively and naturally collect the 11 key assessment fields within the first 8-10 messages. You MUST NOT output the conclusion message until you are confident you have gathered enough information to fill the complete assessment picture.
5. If the user mentions self-harm or suicidal thoughts, express empathy and gently encourage them to seek professional help immediately.
6. Do NOT diagnose mental disorders or prescribe medication.
7. Keep responses SHORT, CONCISE, and HIGHLY CONVERSATIONAL (maximum 2-3 short sentences). Act like a real human texting. Avoid long-winded paragraphs.
8. Focus on being a companion first.
9. CRITICAL: Always read the chat history before asking a question. NEVER repeat a question if the user has already provided the answer (e.g., if they already told you it has been 3 weeks, do not ask how long it has been again. If they already told you about their physical symptoms, do not ask again). Move the conversation forward.
10. CRITICAL RULE: NEVER, UNDER ANY CIRCUMSTANCES, ask the user to rate their feelings, stress, severity, or pain on a numerical scale (e.g., 'scale of 1 to 10'). You must completely avoid using the phrase 'scale of 1-10'. Instead, ask open-ended questions about how they feel.
"""

DOCTOR_SYSTEM_PROMPT = """You are Dr. MindHealth, a professional AI mental health counsellor.
You provide personalized, empathetic mental wellness advice based on the user's assessment data.
Rules:
- Do NOT diagnose mental disorders
- Do NOT prescribe medication  
- Encourage professional help for high-severity cases
- Keep responses structured (max 4-5 sentences)
- Use a calm, clinical yet warm tone
- Always acknowledge the user's feelings first
"""

async def call_gemini(messages: list, system_prompt: str = None, context: dict = None) -> str:
    """Call Google Gemini generateContent REST API."""
    if not GEMINI_API_KEY:
        return "⚠️ **Configuration Error**: The `GEMINI_API_KEY` environment variable is missing or invalid."
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    contents = []
    for m in messages:
        role = "user" if m.get("role") in ["user", "system"] else "model"
        text = m.get("content", "")
        if text:
            contents.append({
                "role": role,
                "parts": [{"text": text}]
            })
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1500
        }
    }
    if system_prompt:
        payload["system_instruction"] = {
            "parts": [{"text": system_prompt}]
        }
        
    max_retries = 3
    timeout_seconds = 45.0
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                    return "I am here with you. Please tell me more about how you are feeling."
                elif response.status_code in [429, 503]:
                    logger.warning(f"Attempt {attempt + 1}: Gemini busy/rate limited ({response.status_code}). Retrying with backoff...")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(1.5 * (2 ** attempt))
                        continue
                else:
                    logger.error(f"Gemini API error {response.status_code}: {response.text}")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(1)
                        continue
        except Exception as e:
            logger.error(f"Gemini connection error: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
                continue
                
    return "I am here with you. Please share what you are experiencing."

async def call_gemini_stream(messages: list, system_prompt: str = None, context: dict = None):
    """Stream response from Google Gemini REST API via SSE."""
    if not GEMINI_API_KEY:
        yield "⚠️ **Configuration Error**: The `GEMINI_API_KEY` environment variable is missing or invalid."
        return
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:streamGenerateContent?key={GEMINI_API_KEY}&alt=sse"
    
    contents = []
    for m in messages:
        role = "user" if m.get("role") in ["user", "system"] else "model"
        text = m.get("content", "")
        if text:
            contents.append({
                "role": role,
                "parts": [{"text": text}]
            })
            
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1500
        }
    }
    if system_prompt:
        payload["system_instruction"] = {
            "parts": [{"text": system_prompt}]
        }
        
    max_retries = 3
    timeout_seconds = 45.0
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code == 200:
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                try:
                                    data = json.loads(line[6:])
                                    candidates = data.get("candidates", [])
                                    if candidates and "content" in candidates[0]:
                                        parts = candidates[0]["content"].get("parts", [])
                                        for p in parts:
                                            if "text" in p and p["text"]:
                                                yield p["text"]
                                except Exception:
                                    continue
                        return
                    elif response.status_code in [429, 503]:
                        logger.warning(f"Attempt {attempt + 1}: Gemini stream busy ({response.status_code}). Retrying with backoff...")
                        if attempt < max_retries - 1:
                            await asyncio.sleep(1.5 * (2 ** attempt))
                            continue
                    else:
                        logger.error(f"Gemini stream error {response.status_code}")
                        if attempt < max_retries - 1:
                            await asyncio.sleep(1)
                            continue
        except Exception as e:
            logger.error(f"Gemini stream exception: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
                continue
                
    yield "I am here with you. Please share what you are experiencing."

async def call_openrouter(messages: list, system_prompt: str = None, context: dict = None) -> str:
    """Call AI service (prioritizes Google Gemini, falls back to OpenRouter)."""
    if GEMINI_API_KEY:
        return await call_gemini(messages, system_prompt, context)
        
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        return "⚠️ **Configuration Error**: No AI API key found. Please configure `GEMINI_API_KEY` in backend/.env"
    
    all_messages = []
    if system_prompt:
        all_messages.append({"role": "system", "content": system_prompt})
    all_messages.extend(messages)
    
    max_retries = 4
    timeout_seconds = 120.0  # Gives OpenRouter plenty of time to respond
    
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                response = await client.post(
                    OPENROUTER_URL,
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://mindhealth.app",
                        "X-Title": "MindHealth"
                    },
                    json={
                        "model": OPENROUTER_MODEL,
                        "messages": all_messages,
                        "max_tokens": 1500,
                        "temperature": 0.7
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                
                elif response.status_code == 429:
                    logger.warning(f"Attempt {attempt + 1}: OpenRouter rate limited (429). Retrying...")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(4 * (2 ** attempt)) # 4s, 8s, 16s
                        continue
                elif response.status_code == 402:
                    logger.error("OpenRouter limit reached (402).")
                    return "⚠️ **API Error (402)**: OpenRouter limit reached. Please check your OpenRouter credits or change the model."
                elif response.status_code in [500, 502, 503, 504]:
                    logger.warning(f"Attempt {attempt + 1}: OpenRouter server busy ({response.status_code}). Retrying...")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                else:
                    logger.error(f"OpenRouter error {response.status_code}: {response.text}")
                    return f"⚠️ **API Error ({response.status_code})**: The AI service could not generate a response. Please check your API key."
                    
        except (httpx.TimeoutException, httpx.RequestError) as e:
            logger.warning(f"Attempt {attempt + 1}: Connection timeout/error ({type(e).__name__}). Retrying...")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
                continue
        except Exception as e:
            logger.error(f"OpenRouter general API error: {e}")
            return f"⚠️ **Connection Error**: Failed to reach the AI service ({str(e)})."
            
    return "I am receiving too many messages at once right now. Please wait about 10 seconds and try sending that again."

async def call_openrouter_stream(messages: list, system_prompt: str = None, context: dict = None):
    """Stream response from AI service (prioritizes Google Gemini, falls back to OpenRouter)."""
    if GEMINI_API_KEY:
        async for chunk in call_gemini_stream(messages, system_prompt, context):
            yield chunk
        return

    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        yield "⚠️ **Configuration Error**: No AI API key found. Please configure `GEMINI_API_KEY` in backend/.env"
        return
    
    all_messages = []
    if system_prompt:
        all_messages.append({"role": "system", "content": system_prompt})
    all_messages.extend(messages)
    
    timeout_seconds = 120.0  
    max_retries = 4
    
    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as client:
                async with client.stream(
                    "POST",
                    OPENROUTER_URL,
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://mindhealth.app",
                        "X-Title": "MindHealth"
                    },
                    json={
                        "model": OPENROUTER_MODEL,
                        "messages": all_messages,
                        "max_tokens": 1500,
                        "temperature": 0.7,
                        "stream": True
                    }
                ) as response:
                    if response.status_code == 200:
                        async for line in response.aiter_lines():
                            if line.startswith("data: "):
                                data_str = line[6:]
                                if data_str.strip() == "[DONE]":
                                    break
                                try:
                                    data_json = json.loads(data_str)
                                    if "choices" in data_json and len(data_json["choices"]) > 0:
                                        delta = data_json["choices"][0].get("delta", {})
                                        content = delta.get("content", "")
                                        if content:
                                            yield content
                                except json.JSONDecodeError:
                                    pass
                        return # Important: exit generator successfully
                    
                    elif response.status_code == 429:
                        if attempt < max_retries - 1:
                            await asyncio.sleep(4 * (2 ** attempt))
                            continue
                            
                    elif response.status_code == 402:
                        yield "⚠️ **API Error (402)**: OpenRouter limit reached. Please check your OpenRouter credits or change the model."
                        return
                            
                    elif response.status_code in [500, 502, 503, 504]:
                        if attempt < max_retries - 1:
                            await asyncio.sleep(2 ** attempt)
                            continue
                            
                    else:
                        text = await response.aread()
                        logger.error(f"OpenRouter stream error {response.status_code}: {text}")
                        yield f"⚠️ **API Error ({response.status_code})**: The AI service could not generate a response. Please check your API key."
                        return
                        
        except (httpx.TimeoutException, httpx.RequestError) as e:
            logger.warning(f"Attempt {attempt + 1}: Connection timeout/error ({type(e).__name__}) in stream. Retrying...")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
                continue
        except Exception as e:
            logger.error(f"OpenRouter stream exception: {e}")
            yield "I am receiving too many messages at once right now. Please wait about 10 seconds and try sending that again."
            return
            
    yield "I am receiving too many messages at once right now. Please wait about 10 seconds and try sending that again."


def build_context_system_prompt(base_prompt: str, context: dict, is_critical: bool = False, next_stage_prompt: str = None) -> str:
    """Helper to inject real-time user state into the prompt."""
    user_name = context.get('user_name', 'Friend')
    p = f"{base_prompt}\n\nCURRENT USER CONTEXT:\n"
    p += f"- Name: {user_name}\n"
    p += f"- Problem: {context.get('problem', 'Not identified')}\n"
    p += f"- Severity: {context.get('severity', 'Not identified')}/10\n"
    p += f"- Triggers: {', '.join(context.get('triggers', [])) if context.get('triggers') else 'None'}\n"
    p += f"- Emotions: {', '.join(context.get('emotions', [])) if context.get('emotions') else 'None'}\n"
    p += f"- Physical Symptoms: {', '.join(context.get('physical_symptoms', [])) if context.get('physical_symptoms') else 'None'}\n"
    p += f"- Coping Method: {context.get('coping_strategy', 'None')}\n\n"
    
    if is_critical:
        p += "CRITICAL: The user is experiencing HIGH severity distress. Please express deep empathy, reassure them they are not alone, and gently ask what might help them feel safe right now. Do not sound robotic.\n\n"
    elif next_stage_prompt:
        p += f"INSTRUCTION: Seamlessly weave the following assessment question into the natural flow of your response: \"{next_stage_prompt}\"\n\n"
    
    return p

async def answer_user_question(user_message: str, context: dict, chat_history: list, next_stage_prompt: str = None) -> str:
    """Generate an AI response, maintaining full memory context and evaluating safety."""
    
    severity = context.get("severity")
    severity = severity if severity is not None else 5
    is_critical = severity >= 8 or context.get("risk_flag")
    
    system_prompt = build_context_system_prompt(COUNSELLING_SYSTEM_PROMPT, context, is_critical=is_critical, next_stage_prompt=next_stage_prompt)
    
    messages = []
    for msg in chat_history[-8:]:
        role = "assistant" if msg["sender"] == "bot" else "user"
        messages.append({"role": role, "content": msg["message"]})
        
    messages.append({"role": "user", "content": user_message})

    reply = await call_openrouter(messages, system_prompt, context)
    return reply

async def answer_user_question_stream(user_message: str, context: dict, chat_history: list, next_stage_prompt: str = None):
    """Generate an AI response as a stream, maintaining full memory context and evaluating safety."""
    
    severity = context.get("severity")
    severity = severity if severity is not None else 5
    is_critical = severity >= 8 or context.get("risk_flag")
    
    system_prompt = build_context_system_prompt(COUNSELLING_SYSTEM_PROMPT, context, is_critical=is_critical, next_stage_prompt=next_stage_prompt)
    
    messages = []
    for msg in chat_history[-8:]:
        role = "assistant" if msg["sender"] == "bot" else "user"
        messages.append({"role": role, "content": msg["message"]})
        
    messages.append({"role": "user", "content": user_message})

    async for chunk in call_openrouter_stream(messages, system_prompt, context):
        yield chunk

async def generate_suggestions(severity: int, risk_level: str, problem: str, mood: str, triggers: list) -> dict:
    """Generate personalized mental health suggestions."""
    triggers_str = ", ".join(triggers) if triggers else "general stress"
    
    if not GEMINI_API_KEY and (not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your-openrouter-api-key-here"):
        return get_static_suggestions(severity, risk_level)
    
    prompt = f"""Generate mental health wellness suggestions for a user with:
- Final Severity Score: {severity}/10
- Risk Level: {risk_level}
- Main Problem: {problem}
- Current Mood: {mood}
- Triggers: {triggers_str}

Return a JSON with keys: lifestyle (list of 3 tips), meditation (string), daily_tasks (list of 5 tasks), quote (string), breathing_tip (string).
Only return valid JSON."""

    try:
        response = await call_openrouter(
            [{"role": "user", "content": prompt}],
            "You are a mental wellness assistant. Return only valid JSON, no markdown."
        )
        
        start = response.find('{')
        end = response.rfind('}') + 1
        if start >= 0 and end > start:
            return json.loads(response[start:end])
    except Exception as e:
        logger.error(f"Suggestions parse error: {e}")
    
    return get_static_suggestions(severity, risk_level)

def get_static_suggestions(severity: int, risk_level: str) -> dict:
    if risk_level == "Low":
        return {
            "lifestyle": ["Maintain regular sleep schedule (7-9 hours)", "Stay socially connected with loved ones", "Practice gratitude journaling daily"],
            "meditation": "Try a 10-minute morning mindfulness meditation to start your day positively.",
            "daily_tasks": ["Drink 8 glasses of water", "10-minute walk in nature", "Write 3 things you're grateful for", "30-min physical exercise", "Read for 20 minutes"],
            "quote": "Every day is a new beginning. Take a deep breath, smile, and start again.",
            "breathing_tip": "Try 4-7-8 breathing: inhale for 4 seconds, hold for 7, exhale for 8."
        }
    elif risk_level == "Moderate":
        return {
            "lifestyle": ["Establish a consistent sleep routine", "Limit caffeine and screen time after 8 PM", "Practice progressive muscle relaxation"],
            "meditation": "Try a 15-minute body scan meditation before bed to release tension.",
            "daily_tasks": ["Drink 2L water", "10-min breathing exercise", "Write 1 positive thought", "15-min walk", "Connect with a friend"],
            "quote": "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated. You are human.",
            "breathing_tip": "Box breathing: breathe in 4s, hold 4s, out 4s, hold 4s. Repeat 4 times."
        }
    else:
        return {
            "lifestyle": ["Please reach out to a mental health professional today", "Call a trusted friend or family member", "Remove yourself from stressful environments temporarily"],
            "meditation": "Try a 5-minute calming breath focus: close eyes, focus only on your breathing, let thoughts pass.",
            "daily_tasks": ["Call one trusted person", "5-min breathing exercise", "Drink water and eat something", "Write your current feelings", "Contact a helpline if needed"],
            "quote": "It's okay to ask for help. Every storm runs out of rain. You are stronger than you know.",
            "breathing_tip": "Emergency calm: breathe in slowly for 5 seconds, out for 5 seconds. Repeat until you feel calmer."
        }



async def extract_assessment_data(chat_history: list) -> dict:
    """Extract clinical assessment data from full chat history into JSON"""
    if not GEMINI_API_KEY and (not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here"):
        return {}
        
    history_text = "\n".join([f"{msg['sender'].capitalize()}: {msg['message']}" for msg in chat_history])
    
    prompt = f"""You are a clinical data extractor. Analyze the chat and output a STRICT JSON mapping to the Assessment Summary fields.

The user will NOT provide a direct 1-10 score. You must dynamically DEDUCE and PREDICT the 'severity' (integer 1-10) and 'risk_level' (Low/Moderate/High) entirely by analyzing the conversational behavior, emotional weight, physical symptoms, and words used in the chat.
To calculate 'severity' (integer 1-10): Analyze the chat context carefully. If the user is coping well, maintaining their routine, and experiencing normal mild stress, score it 1, 2, or 3. If it affects their life significantly but they are managing, score 4 to 8. If there is a severe breakdown, extreme hopelessness, or safety risk, score 9 or 10.

Chat History:
{history_text}

Required JSON Output Keys (exactly 12 fields):
- "problem" (string)
- "duration" (string)
- "severity" (number from 1-10)
- "sentiment" (string)
- "risk_level" (string: "High", "Medium", or "Low")
- "triggers" (list of strings)
- "impact_on_daily_life" (boolean)
- "emotions" (list of strings)
- "physical_symptoms" (list of strings)
- "coping_strategy" (string)
- "support_available" (boolean)
- "additional_notes" (string: For the 'additional_notes' field: You MUST summarize any other significant context, action plans, resolutions, or therapy discussions that occurred in the chat. For example, if the user discussed seeking professional help, asked for guidance, agreed to a new routine, or shared specific fears not covered by other fields, summarize it here in 1-2 sentences. Do NOT leave this empty if the conversation contains meaningful future steps or extra context.)

Return ONLY a raw JSON object. Do NOT include markdown formatting, backticks, or any conversational text."""

    try:
        response = await call_openrouter(
            [{"role": "user", "content": prompt}],
            system_prompt="You are a strict data formatting system. Output ONLY valid JSON."
        )
        
        # Log raw response for debugging
        print(f"\n--- RAW OPENROUTER EXTRACTION RESPONSE ---\n{response}\n------------------------------------------\n")
        logger.info(f"Raw OpenRouter JSON Extractor response: {response}")
        
        # Clean markdown wrappers if hallucinated
        raw_text = response.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        try:
            extracted_data = json.loads(raw_text.strip())
        except json.JSONDecodeError as e:
            logger.error(f"JSONDecodeError during assessment extraction: {e}. Raw response: {response}")
            extracted_data = {}

        # --- HARD OVERRIDE FOR RISK LEVEL AND SEVERITY LABEL ---
        raw_severity_str = str(extracted_data.get("severity", "5"))
        match = re.search(r'\d+', raw_severity_str)
        severity_num = int(match.group()) if match else 5
        
        # Force the correct Label
        if severity_num <= 3:
            sev_label = "Mild"
        elif 4 <= severity_num <= 8:
            sev_label = "Moderate"
        else: # 9 or 10
            sev_label = "High"
            
        # Overwrite the severity field to exact format: "Number (Label)"
        extracted_data["severity"] = f"{severity_num} ({sev_label})"
        extracted_data["overall_assessment"] = sev_label
        
        # Keep the existing Risk Level override
        if severity_num <= 3:
            extracted_data["risk_level"] = "Low"
        elif 4 <= severity_num <= 8:
            extracted_data["risk_level"] = "Medium"
        elif severity_num >= 9:
            extracted_data["risk_level"] = "High"

        print(f"\n--- SUCCESSFULLY PARSED JSON ---\n{extracted_data}\n--------------------------------\n")
        return extracted_data
            
    except Exception as e:
        logger.error(f"Assessment extraction general error: {e}")
        # Even on general API error, provide safe defaults
        return {"severity": 5, "risk_level": "Medium"}

async def doctor_chat_response(user_message: str, context: dict, chat_history: list) -> dict:
    """Generate AI doctor response with mental health context."""
    severity = context.get("final_severity")
    severity = severity if severity is not None else 5
    risk_level = context.get("risk_level", "Moderate")
    problem = context.get("problem", "general stress")
    face_emotion = context.get("facial_emotion", "Neutral")
    voice_mood = context.get("voice_mood", "Stable")
    triggers = ", ".join(context.get("triggers", []))
    
    context_str = f"""User Mental Health Summary:
- Final Severity: {severity}/10
- Risk Level: {risk_level}
- Main Problem: {problem}
- Facial Emotion: {face_emotion}
- Voice Mood: {voice_mood}
- Triggers: {triggers or 'Not identified'}

User Question: {user_message}"""
    
    messages = []
    for msg in chat_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": context_str})
    
    system = DOCTOR_SYSTEM_PROMPT
    if severity >= 8:
        system += "\nIMPORTANT: This user has HIGH severity. Prioritize safety, recommend professional help and helplines."
    
    reply = await call_openrouter(messages, system)
    
    suggested_actions = []
    reply_lower = reply.lower()
    if "breathe" in reply_lower or "breathing" in reply_lower:
        suggested_actions.append("Try a breathing exercise")
    if "walk" in reply_lower or "exercise" in reply_lower:
        suggested_actions.append("Go for a short walk")
    if "professional" in reply_lower or "therapist" in reply_lower:
        suggested_actions.append("Speak with a mental health professional")
    if "friend" in reply_lower or "family" in reply_lower:
        suggested_actions.append("Talk to a trusted friend or family member")
    if not suggested_actions:
        suggested_actions = ["Practice deep breathing", "Write down your thoughts", "Take a short break"]
    
    risk_advice = ""
    if severity >= 8 or context.get("risk_flag", False):
        risk_advice = "⚠️ If you feel unsafe, please contact emergency services (112) or call KEVIN: 1800-599-0019"
    
    return {
        "reply": reply,
        "suggested_actions": suggested_actions[:3],
        "risk_advice": risk_advice
    }


# ============================================================================
# College Student Wellbeing AI Engine (Ages 18-25)
# ============================================================================

STUDENT_WELLBEING_PROMPT = """You are MindHealth AI, an empathetic, non-judgmental student wellbeing advisor specializing in university/college student mental health (ages 18-25).
Your role is to interpret multi-dimensional assessment metrics into practical, student-friendly guidance.

CRITICAL GUIDELINES:
1. NEVER make a medical diagnosis or use clinical labels (do NOT say 'You have Major Depressive Disorder' or 'Clinical GAD').
2. Frame insights around real college life: semester pressures, exams, hostel/PG living, loneliness, placement/internship anxiety, peer comparison, and screen overload.
3. Keep the tone warm, validating, concise, and empowering.
4. Output MUST be valid JSON with the exact structure:
{
  "overview": "2-3 supportive sentences explaining what the scores reflect without sounding clinical.",
  "this_week": ["Actionable student habit 1", "Actionable student habit 2", "Actionable student habit 3"],
  "watch_for": ["Warning sign to monitor 1", "Warning sign to monitor 2"],
  "positive_areas": ["Identified strength or buffer 1", "Identified strength or buffer 2"],
  "suggested_tools": ["Tool name 1", "Tool name 2"]
}
"""

async def generate_student_assessment_insights(scores: dict, profile: dict = None) -> dict:
    """Generate personalized, student-specific insights from 8-dimension assessment scores."""
    profile = profile or {}
    student_year = profile.get("student_year", "College Student")
    field = profile.get("field_of_study", "General Academics")
    living = profile.get("living_situation", "Campus / Shared Living")
    stage = profile.get("academic_stage", "Regular Term")
    
    academic = scores.get("academic_stress", 50)
    anxiety = scores.get("anxiety_score", 50)
    burnout = scores.get("burnout_score", 50)
    sleep = scores.get("sleep_score", 50)
    social = scores.get("social_score", 50)
    career = scores.get("career_stress", 50)
    emotional = scores.get("emotional_score", 50)
    lifestyle = scores.get("lifestyle_score", 50)
    overall = scores.get("overall_score", 50)
    severity = scores.get("severity_category", "Moderate Concern")

    prompt = f"""Student Profile:
- Background: {student_year}, {field}
- Living Arrangement: {living}
- Current Academic Phase: {stage}

Assessment Scores (0-100 scale):
- Academic Stress: {academic}/100
- Anxiety & Overthinking: {anxiety}/100
- Burnout Risk: {burnout}/100
- Sleep & Recovery: {sleep}/100 (higher = better recovery)
- Social & Relationship Wellbeing: {social}/100 (higher = more connected)
- Career & Future Anxiety: {career}/100
- Emotional Wellbeing: {emotional}/100 (higher = more stable)
- Lifestyle & Digital Balance: {lifestyle}/100 (higher = more balanced)
- Overall Wellbeing Index: {overall}/100
- Severity Band: {severity}

Provide the personalized student insights in strictly valid JSON format."""

    # Deterministic fallback tailored to student patterns
    fallback = {
        "overview": (
            f"Your responses reflect that academic workload and future career planning are taking up significant mental bandwidth right now, "
            f"especially in your current {stage.lower()} phase. While your core resilience is intact, intentional recovery breaks will keep you from hitting burnout."
            if academic > 60 or career > 60 else
            "Your wellbeing profile indicates a balanced rhythm across academics and personal life, with steady energy for college commitments."
        ),
        "this_week": [
            "Implement a 25-minute study sprint followed by a mandatory 5-minute screen-free break." if academic > 55 else "Maintain your current steady study cadence without late-night cramming.",
            "Set a hard 11:30 PM curfew for academic assignments to allow at least 7 hours of restorative sleep." if sleep < 60 else "Keep your consistent sleep-wake schedule going through the weekend.",
            "Take a 15-minute daily walk outside your hostel/dorm room to disconnect from campus noise." if burnout > 55 else "Dedicate 20 minutes to a creative or offline hobby you enjoy.",
            "Limit LinkedIn and placement group scrolling to 10 minutes a day to reduce peer comparison." if career > 60 else "Check in with a classmate or friend for an informal coffee or meal."
        ],
        "watch_for": [
            "Staying in bed scrolling on your phone when feeling overwhelmed by coursework.",
            "Skipping meals or relying solely on caffeine to power through late study blocks.",
            "Withdrawing from friends when exam or internship deadlines approach."
        ],
        "positive_areas": [
            "You are proactively checking in on your wellbeing—a powerful indicator of self-awareness."
        ],
        "suggested_tools": [
            "Study & Focus Pomodoro Timer",
            "4-7-8 Deep Sleep Reset",
            "Placement Anxiety Reframe Tool",
            "Reflective Student Journal"
        ]
    }

    if social > 60:
        fallback["positive_areas"].append("Strong social connections provide a valuable buffer against campus stress.")
    if lifestyle > 60:
        fallback["positive_areas"].append("Good daily habits and movement provide a solid physiological foundation.")

    try:
        messages = [{"role": "user", "content": prompt}]
        raw_reply = await call_gemini(messages, STUDENT_WELLBEING_PROMPT)
        if not raw_reply or "Configuration Error" in raw_reply:
            raw_reply = await call_openrouter(messages, STUDENT_WELLBEING_PROMPT)
        
        # Clean JSON markdown fences
        clean = re.sub(r"^```json\s*", "", raw_reply.strip(), flags=re.MULTILINE)
        clean = re.sub(r"^```\s*$", "", clean.strip(), flags=re.MULTILINE).strip()
        parsed = json.loads(clean)
        
        if isinstance(parsed, dict) and "overview" in parsed and "this_week" in parsed:
            return parsed
    except Exception as e:
        logger.warning(f"Student AI insights generation fell back to deterministic rules: {e}")
        
    return fallback


async def generate_journal_prompt(category: str = "General", mood: str = "Neutral") -> dict:
    """Generate college-specific reflective prompts."""
    prompts_by_category = {
        "Academic": [
            "What is one deadline or assignment weighing on your mind, and what is the absolute smallest first step you can take today?",
            "Are you measuring your self-worth by your grades or GPA right now? How would you comfort a friend in this exact position?",
            "What went right in your studies this week, even if it felt small or incomplete?"
        ],
        "Career": [
            "When you feel anxious about placements or career paths, what is the core fear speaking? What evidence proves you are capable of learning?",
            "Name three skills or personal traits you bring to a team that cannot be measured by a single test score or resume bullet.",
            "What does meaningful work look like to you when you ignore other people's expectations?"
        ],
        "Hostel": [
            "How is your living environment (roommates, noise, hostel food) affecting your mood today? What is one boundary or comfort you can create?",
            "If you are feeling homesick or isolated, what is one familiar comfort or call you can make today?",
            "What is one positive interaction you had on campus this week?"
        ],
        "Personal": [
            "What expectation are you holding yourself to that you wouldn't demand of anyone else?",
            "What gave you energy today, and what drained your mental battery?",
            "Write down 3 things your body did for you today while you were busy worrying."
        ]
    }
    
    import random
    selected_list = prompts_by_category.get(category, prompts_by_category["Personal"])
    prompt = random.choice(selected_list)
    return {"category": category, "prompt": prompt}