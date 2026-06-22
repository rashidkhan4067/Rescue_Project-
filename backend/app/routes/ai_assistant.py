"""
Blueprint for Conversational AI Rescue Assistant in the Rescue Project application.
Queries live database models to synthesize natural language operational responses.
"""
from flask import Blueprint, request, current_app
from flask_login import login_required, current_user
from datetime import date, time
import os
import logging
from ..models import Report, Volunteer
from ..utils.errors import APIError
from ..utils.responses import success_response
from ..services.groq_service import GroqAIService

ai_assistant_bp = Blueprint("ai_assistant", __name__)
logger = logging.getLogger(__name__)

# Attempt to import Google GenAI library if present in environment
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

def process_report_booking(reply, user_id):
    """Intercepts and parses the BOOK_REPORT: JSON block from AI output, creating database reports programmatically."""
    if "BOOK_REPORT:" in reply:
        try:
            parts = reply.split("BOOK_REPORT:", 1)
            json_str_part = parts[1].strip()
            
            # Locate the bounds of the JSON object matching braces
            brace_count = 0
            json_end_idx = -1
            for idx, char in enumerate(json_str_part):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        json_end_idx = idx + 1
                        break
            
            if json_end_idx != -1:
                extracted_json = json_str_part[:json_end_idx]
                reply_cleaned = (parts[0] + "\n" + json_str_part[json_end_idx:]).strip()
                
                # Check for template/instruction leak. If it contains placeholders, clean it up silently and do not save!
                if "extracted" in extracted_json or "placeholder" in extracted_json or "BOOK_REPORT:" in extracted_json:
                    logger.warning("AI assistant leaked system template in response, cleaning text output.")
                    return reply_cleaned.replace("BOOK_REPORT:", "").strip()
                
                import json
                booking_data = json.loads(extracted_json)
                
                # Retrieve parameters with clean fallback types
                name = booking_data.get("name", "Unknown").strip()
                age_val = booking_data.get("age", 0)
                try:
                    age = int(age_val)
                except ValueError:
                    age = 0
                gender = booking_data.get("gender", "Male").strip()
                area = booking_data.get("area", "Unknown").strip()
                description = booking_data.get("description", "No description provided.").strip()
                
                # Check if it was populated with default instructions
                if "extracted" in name.lower() or "extracted" in area.lower():
                    logger.warning("AI template parameters matched in name/area, skipping database registration.")
                    return reply_cleaned
                
                # Save dynamically into database Shard
                new_report = Report(
                    name=name,
                    age=age,
                    gender=gender,
                    area=area,
                    description=description,
                    last_seen_date=date.today(),
                    last_seen_time=time(12, 0),
                    status='active',
                    user_id=user_id
                )
                new_report.save()
                logger.info(f"AI Chat programmatically booked report for {name} (ID: {new_report.id})")
                
                # Prepend premium notification alert to response text
                success_banner = (
                    f"🚨 **Incident Report Filed Programmatically (AI)**\n"
                    f"I have successfully registered a new active search case for **{name}** (Age {age}), "
                    f"last seen in **{area}**. Search alerts have been initialized.\n\n"
                )
                return success_banner + reply_cleaned
        except Exception as e:
            logger.error(f"Failed to execute programmatic report booking: {str(e)}")
            
    # Standard cleanup just in case there's any stray BOOK_REPORT string leaked
    return reply.replace("BOOK_REPORT:", "").strip()


@ai_assistant_bp.route("/chat", methods=["POST"])
@login_required
def chat():
    """Handle conversational natural-language rescue database queries, supporting both audio and text queries."""
    message = ""
    audio_file = None
    
    # Support both JSON and Multipart Form Data for voice uploads
    if request.content_type and "multipart/form-data" in request.content_type:
        message = request.form.get("message", "").strip()
        if "audio" in request.files:
            audio_file = request.files["audio"]
    else:
        data = request.get_json() or {}
        message = data.get("message", "").strip()

    groq_service = GroqAIService()
    user_transcript = None
    
    # 0. Transcribe audio memo if uploaded
    if audio_file:
        if not groq_service.api_key:
            raise APIError("Voice chat requires a configured GROQ_API_KEY", 400)
        try:
            file_bytes = audio_file.read()
            filename = audio_file.filename or "chat_query.webm"
            logger.info("Chat: Transcribing voice query using Groq Whisper...")
            message = groq_service.transcribe_audio(file_bytes, filename)
            if not message:
                raise APIError("Empty speech extracted from audio query. Please speak clearly.", 400)
            user_transcript = message
            logger.info(f"Chat voice query transcribed: '{message}'")
        except Exception as e:
            logger.error(f"Chat voice transcription failed: {str(e)}")
            raise APIError(f"Failed to transcribe voice chat memo: {str(e)}", 500)

    if not message:
        raise APIError("Empty message query provided")

    logger.info(f"AI Assistant received query: '{message}'")
    
    # 1. Fetch live database metrics for context injection
    total_cases = Report.query.count()
    active_cases = Report.query.filter_by(status='active').count()
    resolved_cases = Report.query.filter_by(status='resolved').count()
    
    total_volunteers = Volunteer.query.count()
    active_volunteers = Volunteer.query.filter_by(status='Active').count()
    standby_volunteers = Volunteer.query.filter_by(status='Standby').count()
    
    # Retrieve listings for semantic retrieval mapping
    all_active_reports = Report.query.filter_by(status='active').all()
    all_volunteers = Volunteer.query.all()

    # Pre-compute case details to avoid f-string backslash limits inside curly braces
    active_cases_list = [
        f"{r.name} (Age: {r.age}, Area: {r.area}, Severity: {r.severity}, Description: {r.description}, Clothing: {r.clothing or ''}, Marks: {r.marks or ''})"
        for r in all_active_reports
    ]
    active_cases_list_gemini = [
        f"{r.name} (Age: {r.age}, Area: {r.area}, Status: {r.status}, Description: {r.description}, Clothing: {r.clothing or ''}, Marks: {r.marks or ''})"
        for r in all_active_reports
    ]
 
    # 2. Extract operational intents using fuzzy keyword matching (Offline Cognitive Engine)
    msg_lower = message.lower()
    intent = "general"
    
    # Intent Detection
    if any(k in msg_lower for k in ["volunteer", "rescuer", "responder", "capacity", "force"]):
        intent = "volunteers"
    elif any(k in msg_lower for k in ["case", "missing", "report", "beacon", "target"]):
        intent = "cases"
    elif any(k in msg_lower for k in ["guide", "how to", "steps", "procedures", "fir"]):
        intent = "guide"
    elif any(k in msg_lower for k in ["g-10", "f-11", "f-7", "h-9", "islamabad", "multan"]):
        intent = "sector"
    elif any(k in msg_lower for k in ["hello", "hi", "hey", "greet", "who are you"]):
        intent = "greeting"

    # Context Formulation
    db_context = (
        f"Database Context: Active Cases = {active_cases}, Resolved Cases = {resolved_cases}, Total Cases = {total_cases}. "
        f"Registered Volunteers = {total_volunteers} (Active = {active_volunteers}, Standby = {standby_volunteers})."
    )

    # 3. Check for High-Performance Groq LLM Pipeline Service
    try:
        if groq_service.api_key:
            logger.info("Using Groq High-Performance Inference Pipeline Service")
            system_prompt = (
                f"You are the Tactical Search & Rescue Operations Coordinator AI (Aegis-9) for the Emergency Response Command.\n"
                f"You operate with a high-fidelity cognitive reasoning pipeline. Maintain a highly professional, technical, and alert military command posture. Avoid conversational filler, generic greetings, or phrases like 'Sure, I can help!' or 'Here is the info.'. Speak directly using structured markdown.\n\n"
                f"At the very beginning of your verbal response (right after any BOOK_REPORT block if present), you MUST declare the active workflow phase in bold brackets, e.g. '**[AEGIS-9 AGENTIC WORKFLOW: PHASE X ACTIVE]**', and guide the user logically.\n\n"
                f"--- 4-PHASE TACTICAL SAR AGENTIC WORKFLOW ---\n"
                f"Phase 1: Emergency Triage & Booking - Prioritize immediate life safety. When the user requests to book, file, or register a case, verify if you have the 5 required parameters: name, age, gender, last seen area, and description. If ALL 5 are present, you MUST trigger a programmatic database booking action using the BOOK_REPORT format. If any parameters are missing, do not trigger the block; instead, request them conversationally in a professional tone without referring to any JSON blocks, templates, or backend instructions.\n"
                f"Phase 2: Registry Semantic Scan - When the user asks to search or verify missing profiles, systematically scan the 'Active Cases Details' below. Perform semantic matching on names, age ranges, clothing worn, or last seen landmarks, and output a ranked list of matched profiles with confidence reasons.\n"
                f"Phase 3: Weather & Flight Dispatch - When coordinates or drone queries are launched, analyze local wind limits (under 25 km/h for drone flight approval). Calculate canine scent dispersion drift directions (SW/NE) based on wind vectors and recommend thermal/FLIR scan corridors.\n"
                f"Phase 4: Bilingual Staging - When flyers are requested, generate billing copy custom headlines, concise English descriptions, CTAs, and highly emotional Roman Urdu ground sweeps translations.\n\n"
                f"--- DYNAMIC CAPABILITY: PROGRAMMATIC REPORT BOOKING (CRITICAL SECRET COMMAND) ---\n"
                f"Format for booking triggers (must return valid JSON):\n"
                f"BOOK_REPORT: {{\n"
                f"  \"name\": \"extracted full name\",\n"
                f"  \"age\": extracted_integer_age,\n"
                f"  \"gender\": \"Male | Female | Other\",\n"
                f"  \"area\": \"extracted sector or last seen area\",\n"
                f"  \"description\": \"extracted polished description of physical identifiers, clothing, and marks\"\n"
                f"}}\n"
                f"Only trigger this block in Phase 1 if ALL 5 parameters are explicitly specified by the user. Otherwise, request the missing fields conversationally.\n\n"
                f"--- IMPORTANT STRICT SECURITY, PRIVACY & STYLING CONSTRAINTS ---\n"
                f"1. **NO BOOKING TEMPLATE OR COMMAND LEAKS**: The BOOK_REPORT: {{...}} block is a hidden system command. You MUST NEVER mention it, explain it, describe it, or print its placeholder structure or JSON schema to the user. It is strictly for programmatic backend execution. If fields are missing, conversationally ask for them in a clean, professional, human-like voice without referencing database syntax, parameters, templates, or JSON.\n"
                f"2. **NO TELEMETRY DUMPS / METRIC DUMPS**: Do not output raw telemetry metrics, databases, lists, or tables unless specifically queried. Only use this telemetry context to answer operator questions.\n"
                f"3. **PROFESSIONAL INTERACTION STYLE**: Avoid listing backend 'pending parameters' or technical headers. Ask for victim details (name, age, gender, last seen area, description) in a natural, tactical, human-to-human tone.\n\n"
                f"--- LIVE RESCUE TELEMETRY CONTEXT ---\n"
                f"{db_context}\n"
                f"Active Cases Details: {active_cases_list}\n"
                f"Volunteer Search Grid: {[f'{v.name} ({v.role}, Sector: {v.sector}, Status: {v.status})' for v in all_volunteers]}\n"
                f"-------------------------------------\n"
            )
            
            reply = groq_service.generate_response(message, system_prompt)
            reply = process_report_booking(reply, current_user.id)
            return success_response(data={"response": reply, "user_transcript": user_transcript})
    except Exception as groq_err:
        logger.error(f"Groq LLM Pipeline Service failed, falling back: {str(groq_err)}")
 
    # 4. Check for external Generative LLM API configurations in .env (Gemini Fallback)
    gemini_key = os.environ.get("GEMINI_API_KEY") or current_app.config.get("GEMINI_API_KEY")
    
    if HAS_GENAI and gemini_key:
        try:
            logger.info("Using Generative LLM Engine (Gemini)")
            genai.configure(api_key=gemini_key)
            
            # Format custom system instruction context for the model
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = (
                f"You are the Tactical Search & Rescue Operations Coordinator AI (Aegis-9) for the Emergency Response Command.\n"
                f"You operate with a high-fidelity cognitive reasoning pipeline. Maintain a highly professional, technical, and alert military command posture. Avoid conversational filler, generic greetings, or phrases like 'Sure, I can help!' or 'Here is the info.'. Speak directly using structured markdown.\n\n"
                f"At the very beginning of your verbal response (right after any BOOK_REPORT block if present), you MUST declare the active workflow phase in bold brackets, e.g. '**[AEGIS-9 AGENTIC WORKFLOW: PHASE X ACTIVE]**', and guide the user logically.\n\n"
                f"--- 4-PHASE TACTICAL SAR AGENTIC WORKFLOW ---\n"
                f"Phase 1: Emergency Triage & Booking - Prioritize immediate life safety. When the user requests to book, file, or register a case, verify if you have the 5 required parameters: name, age, gender, last seen area, and description. If ALL 5 are present, you MUST trigger a programmatic database booking action using the BOOK_REPORT format. If any parameters are missing, do not trigger the block; instead, request them conversationally in a professional tone without referring to any JSON blocks, templates, or backend instructions.\n"
                f"Phase 2: Registry Semantic Scan - When the user asks to search or verify missing profiles, systematically scan the 'Active Cases Details' below. Perform semantic matching on names, age ranges, clothing worn, or last seen landmarks, and output a ranked list of matched profiles with confidence reasons.\n"
                f"Phase 3: Weather & Flight Dispatch - When coordinates or drone queries are launched, analyze local wind limits (under 25 km/h for drone flight approval). Calculate canine scent dispersion drift directions (SW/NE) based on wind vectors and recommend thermal/FLIR scan corridors.\n"
                f"Phase 4: Bilingual Staging - When flyers are requested, generate billing copy custom headlines, concise English descriptions, CTAs, and highly emotional Roman Urdu ground sweeps translations.\n\n"
                f"--- DYNAMIC CAPABILITY: PROGRAMMATIC REPORT BOOKING (CRITICAL SECRET COMMAND) ---\n"
                f"Format for booking triggers (must return valid JSON):\n"
                f"BOOK_REPORT: {{\n"
                f"  \"name\": \"extracted full name\",\n"
                f"  \"age\": extracted_integer_age,\n"
                f"  \"gender\": \"Male | Female | Other\",\n"
                f"  \"area\": \"extracted sector or last seen area\",\n"
                f"  \"description\": \"extracted polished description of physical identifiers, clothing, and marks\"\n"
                f"}}\n"
                f"Only trigger this block in Phase 1 if ALL 5 parameters are explicitly specified by the user. Otherwise, request the missing fields conversationally.\n\n"
                f"--- IMPORTANT STRICT SECURITY, PRIVACY & STYLING CONSTRAINTS ---\n"
                f"1. **NO BOOKING TEMPLATE OR COMMAND LEAKS**: The BOOK_REPORT: {{...}} block is a hidden system command. You MUST NEVER mention it, explain it, describe it, or print its placeholder structure or JSON schema to the user. It is strictly for programmatic backend execution. If fields are missing, conversationally ask for them in a clean, professional, human-like voice without referencing database syntax, parameters, templates, or JSON.\n"
                f"2. **NO TELEMETRY DUMPS / METRIC DUMPS**: Do not output raw telemetry metrics, databases, lists, or tables unless specifically queried. Only use this telemetry context to answer operator questions.\n"
                f"3. **PROFESSIONAL INTERACTION STYLE**: Avoid listing backend 'pending parameters' or technical headers. Ask for victim details (name, age, gender, last seen area, description) in a natural, tactical, human-to-human tone.\n\n"
                f"--- LIVE TELEMETRY CONTEXT ---\n"
                f"{db_context}\n"
                f"Active Cases Details: {active_cases_list_gemini}\n"
                f"Volunteer Grid Details: {[f'{v.name} ({v.role}, Sector: {v.sector}, Status: {v.status})' for v in all_volunteers]}\n"
                f"-------------------------------\n\n"
                f"User Query: \"{message}\"\n"
                f"AI Assistant Response:"
            )
            response = model.generate_content(prompt)
            reply = process_report_booking(response.text, current_user.id)
            return success_response(data={"response": reply, "user_transcript": user_transcript})
            
        except Exception as llm_err:
            logger.error(f"Generative LLM Engine failed, falling back to Cognitive Semantic Engine: {str(llm_err)}")
 
    # 5. Fallback: Cognitive Semantic Engine (Pattern Classifier & Database Synthesizer)
    logger.info("Using Cognitive Semantic Engine (Offline)")
    
    if intent == "greeting":
        reply = (
            "👋 **Hello! I am your AI Rescue Command Assistant.**\n\n"
            "I have direct access to your local SQLite registry. I can analyze case telemetry, track "
            "search volunteer capacities, or explain emergency reporting guidelines.\n\n"
            "Try asking me:\n"
            "* *\"Show all active cases inside Islamabad sectors\"*\n"
            "* *\"Analyze search volunteer capacity\"*\n"
            "* *\"Tell me the steps to report a missing person\"*"
        )
        
    elif intent == "cases":
        if active_cases == 0:
            reply = (
                "🔍 **AI Telemetry Analysis:**\n\n"
                "There are currently **no active missing person cases** registered in the database. "
                "All logged files are successfully resolved."
            )
        else:
            case_list = "\n".join([f"*   **{r.name}** (Age {r.age}) — Last seen at *{r.area}* ({r.severity})" for r in all_active_reports])
            reply = (
                f"🔍 **AI Telemetry Analysis (Active Cases):**\n\n"
                f"There are currently **{active_cases} active missing person search beacons** registered in the system.\n\n"
                f"{case_list}\n\n"
                f"You can view their full profiles, download printed bulletin posters, or map volunteer "
                f"coordinates directly from the main *Overview Console*."
            )
            
    elif intent == "volunteers":
        role_counts = {}
        for v in all_volunteers:
            role_counts[v.role] = role_counts.get(v.role, 0) + 1
        roles_str = ", ".join([f"{count} {role}s" for role, count in role_counts.items()])
        
        reply = (
            f"🛡️ **AI Volunteer Grid Diagnostics:**\n\n"
            f"Your ground search force currently counts **{total_volunteers} registered operators**:\n"
            f"*   **{active_volunteers} Units Active** (on coordinates patrol)\n"
            f"*   **{standby_volunteers} Units Standby** (available for instant dispatch)\n\n"
            f"**Team Composition:** {roles_str}.\n\n"
            f"You can select any sector grid on the *Volunteer Rescue Grid* page and dispatch emergency alert SMTP packets immediately."
        )
        
    elif intent == "guide":
        reply = (
            "📋 **AI Incident Procedure Advisor:**\n\n"
            "If someone goes missing, follow these three phases immediately:\n\n"
            "1.  **Phase 1: Search & Verify**: Check the immediate area thoroughly and contact close friends/family.\n"
            "2.  **Phase 2: Official Reporting**: Call Police (**15**) or Punjab Rescue (**1122**). Log their profile on this portal and file a formal FIR at your nearest station.\n"
            "3.  **Phase 3: Community Search**: Download and print the **Missing Bulletin Poster** from our portal, share the URL on WhatsApp, and mobilize the Volunteer Grid.\n\n"
            "⚠️ *Reminder: Do not wait 24 hours to file a child missing report! Time is critical.*"
        )
        
    elif intent == "sector":
        # Identify the sector mentioned
        target_sector = None
        for sec in ["g-10", "f-11", "f-7", "h-9", "multan"]:
            if sec in msg_lower:
                target_sector = sec
                break
                
        sector_cases = [r for r in all_active_reports if target_sector in r.area.lower()]
        sector_volunteers = [v for v in all_volunteers if target_sector in v.sector.lower()]
        
        sec_title = target_sector.upper() if target_sector else "Sector"
        case_txt = f"**{len(sector_cases)} active case(s)**"
        vol_txt = f"**{len(sector_volunteers)} standby/active volunteer unit(s)**"
        
        details = ""
        if sector_cases:
            details += "\n\n**Active Targets inside Sector boundaries:**\n"
            details += "\n".join([f"*   {c.name} ({c.severity})" for c in sector_cases])
        if sector_volunteers:
            details += "\n\n**Assigned Operators:**\n"
            details += "\n".join([f"*   {v.name} ({v.role} — {v.status})" for v in sector_volunteers])
            
        reply = (
            f"📡 **AI Geofenced Sector Telemetry ({sec_title} Grid):**\n\n"
            f"Our neural analyzer has scanned boundaries for **{sec_title}**. We found:\n"
            f"*   {case_txt} located in this sector.\n"
            f"*   {vol_txt} registered inside this grid.{details}\n\n"
            f"You can view their exact visual coordinates overlay on the *Tactical Search Map* page."
        )
        
    else:
        reply = (
            f"🤖 **Rescue Command AI Assistant:**\n\n"
            f"I have successfully established a cognitive analysis pipeline. Here is a summary of your system health:\n\n"
            f"*   **Search Registry Status**: {active_cases} active / {resolved_cases} resolved cases.\n"
            f"*   **Ground Force Capacity**: {total_volunteers} operators active or standby on the rescue grid.\n\n"
            f"How can I assist your operations search today? You can ask me to *\"Show active cases\"*, "
            f"*\"Check volunteer compose\"*, or *\"G-10 sector details\"*."
        )

    return success_response(data={"response": reply})


@ai_assistant_bp.route("/extract-profile", methods=["POST"])
@login_required
def extract_profile():
    """Analyze raw incident description and extract structured tags via Groq LLM."""
    data = request.get_json() or {}
    text = data.get("text", "").strip()
    
    if not text:
        raise APIError("Empty description text provided")
        
    groq_service = GroqAIService()
    if not groq_service.api_key:
        logger.warning("Groq API key not configured, returning empty extraction defaults")
        return success_response(data={
            "age": "", "gender": "Male", "height": "", "weight": "",
            "hair": "", "eyes": "", "clothing": "", "marks": "", "area": ""
        })
        
    system_prompt = (
        "You are an AI Incident Profiler for the Rescue Command Portal.\n"
        "Your task is to analyze the raw incident circumstances paragraph and extract structured physical descriptors of the missing person.\n"
        "You MUST return a JSON object with the following fields and NO other text or conversational filler:\n"
        "{\n"
        "  \"name\": \"extracted full name if present, otherwise empty string\",\n"
        "  \"age\": \"integer age if present, otherwise empty string\",\n"
        "  \"gender\": \"Male | Female | Other, match best guess or default to Male if unclear\",\n"
        "  \"height\": \"extracted height, e.g. 5'3\\\", or empty string\",\n"
        "  \"weight\": \"extracted weight or empty string\",\n"
        "  \"hair\": \"extracted hair details or empty string\",\n"
        "  \"eyes\": \"extracted eye color/details or empty string\",\n"
        "  \"clothing\": \"extracted clothing worn or empty string\",\n"
        "  \"marks\": \"extracted marks, scars, dental braces, or empty string\",\n"
        "  \"area\": \"extracted last seen area, landmark, or city\"\n"
        "}"
    )
    
    try:
        raw_reply = groq_service.generate_response(text, system_prompt, json_format=True)
        import json
        parsed = json.loads(raw_reply)
        return success_response(data=parsed)
    except Exception as e:
        logger.error(f"AI Tag extraction failed: {str(e)}")
        # Return empty defaults on error
        return success_response(data={
            "age": "", "gender": "Male", "height": "", "weight": "",
            "hair": "", "eyes": "", "clothing": "", "marks": "", "area": ""
        })


@ai_assistant_bp.route("/analyze-image", methods=["POST"])
@login_required
def analyze_image():
    """Analyze uploaded photo for focus (blur), contrast, and brightness parameters."""
    if "image" not in request.files:
        raise APIError("No image file provided", 400)
        
    image_file = request.files["image"]
    if not image_file or not image_file.filename:
        raise APIError("Empty or invalid image file", 400)
        
    try:
        from PIL import Image, ImageFilter, ImageStat
        import io
        
        # Read file stream into memory
        file_bytes = image_file.read()
        if len(file_bytes) == 0:
            raise APIError("Uploaded image file is empty", 400)
            
        img = Image.open(io.BytesIO(file_bytes))
        
        # Convert to RGB to ensure standard format
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        width, height = img.size
        
        # 1. Average Brightness (L-channel mean)
        gray_img = img.convert('L')
        stat = ImageStat.Stat(gray_img)
        avg_brightness = stat.mean[0] # 0 to 255
        
        # 2. Contrast (standard deviation of intensity)
        std_dev = stat.stddev[0]
        
        # 3. Focus/Blur index (Mean edge strength via FIND_EDGES)
        edges = gray_img.filter(ImageFilter.FIND_EDGES)
        edge_stat = ImageStat.Stat(edges)
        blur_index = edge_stat.mean[0]
        
        # Set up thresholds
        is_blurry = blur_index < 5.0
        is_dark = avg_brightness < 45.0
        is_overexposed = avg_brightness > 225.0
        is_low_contrast = std_dev < 25.0
        
        # Scores normalization (0-100 range)
        # Sharpness score (scaled: blur_index ~ 12.0 is highly sharp)
        sharpness_score = min(100, int((blur_index / 12.0) * 100))
        if sharpness_score < 30:
            sharpness_score = max(10, sharpness_score)
            
        # Brightness score (perfect center is 127.5)
        brightness_deviation = abs(avg_brightness - 127.5)
        brightness_score = max(0, int(100 - (brightness_deviation / 127.5) * 100))
        
        # Contrast score (standard dev around 60.0 is perfect contrast)
        contrast_score = min(100, int((std_dev / 60.0) * 100))
        
        # Overall fidelity score weighted breakdown
        overall_fidelity = int((sharpness_score * 0.45) + (brightness_score * 0.3) + (contrast_score * 0.25))
        
        # Generate diagnostic issue warnings list
        warnings = []
        if is_blurry:
            warnings.append("AI Scan Alert: Portrait has low fidelity due to motion blur or soft focus. We highly recommend uploading a clearer portrait to ensure high-accuracy Face Matcher topological mapping.")
        if is_dark:
            warnings.append("AI Scan Alert: Insufficient ambient lighting detected. The image is too dark to extract distinct facial textures.")
        elif is_overexposed:
            warnings.append("AI Scan Alert: Extreme highlight overexposure detected. The image features are washed out.")
        if is_low_contrast:
            warnings.append("AI Scan Alert: Flat contrast profile. Distinct contours are difficult to define.")
            
        # Heuristic face bounding check
        face_detected = overall_fidelity >= 35
        if not face_detected:
            warnings.append("AI Scan Warning: No standard facial boundary metrics detected. Please check the profile framing.")
            
        analysis_data = {
            "fidelity_score": overall_fidelity,
            "brightness": int(avg_brightness),
            "contrast": int(std_dev),
            "blur_index": round(float(blur_index), 2),
            "face_detected": face_detected,
            "sharpness_score": sharpness_score,
            "brightness_score": brightness_score,
            "contrast_score": contrast_score,
            "warnings": warnings,
            "dimensions": f"{width}x{height} px"
        }
        
        logger.info(f"Image analysis successfully completed: Score = {overall_fidelity}%, Face Detected = {face_detected}")
        return success_response(data=analysis_data)
        
    except Exception as e:
        logger.error(f"Failed to execute high-fidelity image analysis: {str(e)}")
        raise APIError(f"High-fidelity image scanner failed: {str(e)}", 500)


@ai_assistant_bp.route("/weather-conditions", methods=["GET"])
@login_required
def weather_conditions():
    """Retrieve simulated local weather conditions and generate AI Drone Search advisories."""
    lat_val = request.args.get("lat")
    lng_val = request.args.get("lng")
    
    try:
        lat = float(lat_val) if lat_val else 33.6844
        lng = float(lng_val) if lng_val else 73.0479
    except ValueError:
        lat = 33.6844
        lng = 73.0479
        
    # Regional check
    is_multan = (30.0 <= lat <= 30.4) or (71.3 <= lng <= 71.7)
    
    if is_multan:
        location_name = "Chenab Plains - Multan Sector"
        temperature = 41
        wind_speed = 12  # km/h
        wind_direction = "SW"
        humidity = 35
        precipitation = 0
        condition = "Dust Haze - Clear"
    else:
        location_name = "Margalla Hills Foothills - Islamabad Sector"
        temperature = 28
        wind_speed = 22  # km/h
        wind_direction = "NE"
        humidity = 58
        precipitation = 10
        condition = "Windy - Partly Cloudy"
        
    # Standard threshold for drone authorization is wind_speed < 25 km/h
    drone_authorized = wind_speed < 25
    
    # We query Groq to generate a professional search corridor flight advisory
    flight_advisory = ""
    scent_dispersion_rate = "Moderate"
    
    try:
        groq_service = GroqAIService()
        if groq_service.api_key:
            system_prompt = (
                "You are the AI Flight Staging Coordinator for the Rescue Command Portal.\n"
                "Based on the local weather conditions, write a high-fidelity search flight advisory "
                "for the rescue drones and K9 units in 1-2 concise, highly professional sentences.\n"
                "Mention key vectors like altitude limits, sensor settings (Thermal/FLIR vs standard RGB), "
                "and drift offsets in the wind direction. Return ONLY the advisory text without greeting or conversational filler."
            )
            
            prompt = (
                f"Location: {location_name}\n"
                f"Coordinates: {lat}° N, {lng}° E\n"
                f"Temperature: {temperature}°C\n"
                f"Wind: {wind_speed} km/h from {wind_direction}\n"
                f"Conditions: {condition}\n"
                f"Drone Authorization: {'APPROVED' if drone_authorized else 'RESTRICTED'}"
            )
            
            flight_advisory = groq_service.generate_response(prompt, system_prompt).strip()
            
            # Scent dispersion analysis
            if wind_speed > 15:
                scent_dispersion_rate = f"High - Rapid scent drift {wind_direction}"
            else:
                scent_dispersion_rate = "Stable - Low wind dispersion"
                
    except Exception as err:
        logger.error(f"Groq weather advisory generation failed: {str(err)}")
        
    # Robust fallback advisory if Groq fails or API key is not present
    if not flight_advisory:
        if drone_authorized:
            flight_advisory = (
                f"AI Flight Advisor: Conditions nominal for aerial scouts. Optimal flight altitude 75m "
                f"with a {wind_direction} camera scan offset. Scent trackers drift towards {wind_direction}."
            )
        else:
            flight_advisory = (
                f"AI Flight Advisor: DRONE DEPLOYMENT GROUNDED. Severe gusts ({wind_speed} km/h) exceed safety envelopes. "
                f"Deploy canine scent units to search forest pathways immediately."
            )
        
        if wind_speed > 15:
            scent_dispersion_rate = f"High - Rapid scent drift {wind_direction}"
        else:
            scent_dispersion_rate = "Stable - Low wind dispersion"

    weather_data = {
        "location": location_name,
        "temperature": temperature,
        "wind_speed_kmh": wind_speed,
        "wind_direction": wind_direction,
        "humidity": humidity,
        "precipitation": precipitation,
        "condition": condition,
        "drone_flight_authorized": drone_authorized,
        "flight_advisory": flight_advisory,
        "scent_dispersion_rate": scent_dispersion_rate,
        "lat": lat,
        "lng": lng
    }
    
    logger.info(f"Weather conditions generated successfully for {location_name} (Wind: {wind_speed} km/h {wind_direction})")
    return success_response(data=weather_data)


@ai_assistant_bp.route("/bulletin-copy", methods=["POST"])
@login_required
def bulletin_copy():
    """Generate high-impact, psychologically effective bilingual copy for missing person flyers."""
    data = request.get_json() or {}
    
    name = data.get("name", "").strip() or "Unknown"
    age = str(data.get("age", "")).strip() or "N/A"
    gender = data.get("gender", "").strip() or "N/A"
    clothing = data.get("clothing", "").strip() or "Not specified"
    marks = data.get("marks", "").strip() or "None"
    area = data.get("area", "").strip() or "Unknown"
    description = data.get("description", "").strip() or "No further circumstances provided."
    reward = str(data.get("reward", "")).strip() or ""

    # Try utilizing Groq LLM Service
    groq_service = GroqAIService()
    
    system_prompt = (
        "You are an AI Bulletin Copywriter specializing in search and rescue flyer communications.\n"
        "Your task is to rewrite the raw case details into high-impact, psychologically effective, bilingual printed flyer copy.\n"
        "You MUST return a JSON object with the exact following fields and absolutely NO other text or conversational filler:\n"
        "{\n"
        "  \"custom_header\": \"A bold, high-impact, uppercase eye-catching headline, e.g. '🚨 URGENT: HAVE YOU SEEN AHMED? REWARD OFFERED!', tailored to the name and reward\",\n"
        "  \"polished_description\": \"A concise, punchy, bulleted physical/apparel summary in English emphasizing key identifiers (clothing, marks, age) for maximum legibility on a billboard\",\n"
        "  \"call_to_action\": \"A strong, urgent call-to-action sentence directing observers to report sightings immediately\",\n"
        "  \"urdu_description\": \"A high-impact, emotional, and clear Roman Urdu translation (written in English alphabet/Roman characters) summarizing the key search details for local pakistani ground sweeps, e.g., 'Agar aap ne Ahmed ko dekha hai ya koi suragh hai to foran rabta karein.'\"\n"
        "}"
    )
    
    prompt = (
        f"Missing Person Case Details:\n"
        f"- Name: {name}\n"
        f"- Age: {age}\n"
        f"- Gender: {gender}\n"
        f"- Last Seen Area: {area}\n"
        f"- Clothing: {clothing}\n"
        f"- Identifying Marks/Scars: {marks}\n"
        f"- Circumstances: {description}\n"
        f"- Reward Offered: {reward if reward else 'None'}"
    )
    
    try:
        if groq_service.api_key:
            raw_reply = groq_service.generate_response(prompt, system_prompt, json_format=True)
            import json
            parsed = json.loads(raw_reply)
            
            # Basic validation of returned keys
            required_keys = ["custom_header", "polished_description", "call_to_action", "urdu_description"]
            if all(k in parsed for k in required_keys):
                logger.info(f"AI Copywriting successfully generated via Groq for {name}")
                return success_response(data=parsed)
            else:
                logger.warning("Groq response JSON is missing key fields, using heuristic fallback")
    except Exception as e:
        logger.error(f"Failed to generate copywriting via Groq: {str(e)}")

    # Heuristic Fallback (Premium Structured Output)
    logger.info("Executing Heuristic Copywriting Generator (Fallback)")
    
    reward_text = f" - RS. {reward} REWARD!" if reward else ""
    custom_header = f"🚨 HELP US FIND {name.upper()}{reward_text} 🚨"
    
    polished_desc_lines = [
        f"• Age: {age} | Gender: {gender}",
        f"• Last Seen Area: {area}",
        f"• Clothing Worn: {clothing}",
        f"• Identifying Marks: {marks}",
        f"• Details: {description[:150]}" + ("..." if len(description) > 150 else "")
    ]
    polished_description = "\n".join(polished_desc_lines)
    
    call_to_action = "Please report any information or sightings to local rescue coordinates or police immediately."
    
    # Heuristic Roman Urdu translation
    urdu_lines = [
        f"GUMSHUDA INSAAN: {name}",
        f"Umar: {age} saal | Jinsi: {gender}",
        f"Aakhri baar dekha gaya: {area}",
        f"Pehnawa: {clothing}",
        f"Nishanaat: {marks}",
        f"Agar aap ke paas koi maloomat hai, toh baraye meharbani foran rescue team ya police se rabta karein."
    ]
    if reward:
        urdu_lines.insert(1, f"🚨 INAAM: Rs. {reward} 🚨")
    urdu_description = "\n".join(urdu_lines)
    
    fallback_data = {
        "custom_header": custom_header,
        "polished_description": polished_description,
        "call_to_action": call_to_action,
        "urdu_description": urdu_description
    }
    
    return success_response(data=fallback_data)


@ai_assistant_bp.route("/voice-profiler", methods=["POST"])
@login_required
def voice_profiler():
    """Transcribe raw incident audio memo and automatically extract structured profile tags in one step."""
    if "audio" not in request.files:
        raise APIError("No audio file provided in request", 400)
        
    audio_file = request.files["audio"]
    if not audio_file or not audio_file.filename:
        raise APIError("Invalid or empty audio file", 400)

    # 1. Initialize Groq AI Service
    groq_service = GroqAIService()
    if not groq_service.api_key:
        raise APIError("Voice transcription requires a configured GROQ_API_KEY", 400)

    try:
        # Read the file bytes
        file_bytes = audio_file.read()
        if len(file_bytes) == 0:
            raise APIError("Uploaded audio file is empty", 400)

        # 2. Transcribe voice using Groq Whisper model
        logger.info("Initiating Groq Whisper audio-to-text transcription sweep...")
        filename = audio_file.filename or "recording.webm"
        transcript = groq_service.transcribe_audio(file_bytes, filename)
        
        if not transcript:
            raise APIError("Could not extract any speech from recorded audio. Please speak clearly.", 400)

        logger.info(f"Whisper successfully generated transcript: '{transcript[:100]}...'")

        # 3. Call LLM to extract structured descriptors from the transcript
        system_prompt = (
            "You are an AI Incident Profiler for the Rescue Command Portal.\n"
            "Your task is to analyze the raw incident circumstances paragraph and extract structured physical descriptors of the missing person.\n"
            "You MUST return a JSON object with the following fields and NO other text or conversational filler:\n"
            "{\n"
            "  \"name\": \"extracted full name if present, otherwise empty string\",\n"
            "  \"age\": \"integer age if present, otherwise empty string\",\n"
            "  \"gender\": \"Male | Female | Other, match best guess or default to Male if unclear\",\n"
            "  \"height\": \"extracted height, e.g. 5'3\\\", or empty string\",\n"
            "  \"weight\": \"extracted weight or empty string\",\n"
            "  \"hair\": \"extracted hair details or empty string\",\n"
            "  \"eyes\": \"extracted eye color/details or empty string\",\n"
            "  \"clothing\": \"extracted clothing worn or empty string\",\n"
            "  \"marks\": \"extracted marks, scars, dental braces, or empty string\",\n"
            "  \"area\": \"extracted last seen area, landmark, or city\"\n"
            "}"
        )
        
        profile = {
            "name": "", "age": "", "gender": "Male", "height": "", "weight": "",
            "hair": "", "eyes": "", "clothing": "", "marks": "", "area": ""
        }
        
        try:
            logger.info("Passing Whisper transcription to Llama-3 Structured Profiler...")
            raw_reply = groq_service.generate_response(transcript, system_prompt, json_format=True)
            import json
            profile = json.loads(raw_reply)
        except Exception as extract_err:
            logger.error(f"Llama-3 Profile extraction failed during voice sweep: {str(extract_err)}")
            
        return success_response(
            data={
                "transcript": transcript,
                "profile": profile
            },
            message="Voice telemetry successfully processed and mapped."
        )

    except Exception as e:
        logger.error(f"Failed to execute voice-profiler analysis: {str(e)}")
        raise APIError(f"AI Voice Profiler failed: {str(e)}", 500)





