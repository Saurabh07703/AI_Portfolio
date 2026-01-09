from fastapi import APIRouter, Request, Form
from fastapi.responses import Response
from rag_engine import RAGEngine
# Reuse the existing engine instance from main (will need to import or dependency inject, 
# for now we'll import the class but ideally main.py passes the instance. 
# To keep it simple and avoid circular imports, we will use a dedicated function to set the engine).

router = APIRouter(tags=["Voice Agent"])

# Global reference to the RAG engine (set by main.py startup)
rag_engine_instance = None

def set_rag_engine(engine):
    global rag_engine_instance
    rag_engine_instance = engine

@router.post("/voice/start")
async def voice_start(From: str = Form(None)):
    """
    Twilio Webhook: Called when a call comes in.
    Returns TwiML to greet the user and gather input.
    """
    # TwiML response
    twiml_response = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello! Thank you for calling AI Jewelry. I am your virtual assistant. How can I help you today?</Say>
    <Gather input="speech" action="/voice/process" timeout="5" speechTimeout="auto">
    </Gather>
    <Say>I didn't hear anything. Please try calling back later. Goodbye.</Say>
</Response>"""
    return Response(content=twiml_response, media_type="application/xml")

@router.post("/voice/process")
async def voice_process(SpeechResult: str = Form(None)):
    """
    Twilio Webhook: Called after the user speaks.
    Processes the speech using RAG and returns the response.
    """
    if not SpeechResult:
        twiml_response = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, I didn't catch that. Could you please repeat?</Say>
    <Gather input="speech" action="/voice/process" timeout="5">
    </Gather>
</Response>"""
        return Response(content=twiml_response, media_type="application/xml")

    # Process query
    print(f"User said: {SpeechResult}")
    
    if rag_engine_instance:
        result = rag_engine_instance.process_query(SpeechResult)
        ai_response = result['response_text']
        
        # Simplify response for voice (remove markdown artifacts if any)
        ai_response = ai_response.replace("**", "")
    else:
        ai_response = "I'm currently having trouble accessing my brain. Please try again later."

    # TwiML response loop
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">{ai_response}</Say>
    <Pause length="1"/>
    <Say voice="alice">Is there anything else I can help you with?</Say>
    <Gather input="speech" action="/voice/process" timeout="5" speechTimeout="auto">
    </Gather>
    <Say>Thank you for calling. Have a wonderful day!</Say>
</Response>"""
    
    
    return Response(content=twiml_response, media_type="application/xml")

from pydantic import BaseModel

class VoiceRequest(BaseModel):
    message: str

@router.post("/voice/chat")
async def voice_chat_frontend(request: VoiceRequest):
    """
    Frontend Endpoint: Receives text from browser Speech-to-Text,
    returns text for browser Text-to-Speech.
    """
    if rag_engine_instance:
        result = rag_engine_instance.process_query(request.message)
        ai_response = result['response_text']
        # Clean up for speech
        ai_response = ai_response.replace("**", "").replace("*", "")
        return {"response": ai_response}
    else:
        return {"response": "I'm currently offline. Please check back later."}
