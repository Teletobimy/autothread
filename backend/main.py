"""
Threads Auto Poster - Cloud Run Backend API
FastAPI server for content generation, translation, and Threads posting
"""
import os
import time
from typing import Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Import our modules
from content_generator import ContentGenerator
from threads_api import ThreadsAPI
from sheets_manager import SheetsManager

# Initialize Firebase Admin
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if not firebase_admin._apps:
        # Use default credentials in Cloud Run
        firebase_admin.initialize_app()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Threads Auto Poster API",
    description="AI-powered content generation and auto-posting for Threads",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class GenerateRequest(BaseModel):
    model: str = "gemini-2.5-flash"
    prompt: str
    count: int = 1
    save_to_firestore: bool = True
    org_id: Optional[str] = None  # Organization ID for multi-tenant storage

class TranslateRequest(BaseModel):
    model: str = "gemini-2.5-flash"
    target_lang: str = "english"
    source_doc_ids: Optional[List[str]] = None

class PostRequest(BaseModel):
    org_id: str  # Required: Organization ID to get Threads config from Firestore
    sheet_name: str = "쓰레드"
    interval_minutes: int = 60

class StatusResponse(BaseModel):
    google: bool
    threads: bool
    gcp: bool

# Helper to get Firestore client
def get_firestore():
    return firestore.client()

# Routes
@app.get("/")
async def root():
    return {"message": "Threads Auto Poster API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/status", response_model=StatusResponse)
async def check_status():
    """Check configuration status"""
    return StatusResponse(
        google=bool(os.getenv("GOOGLE_API_KEY")),
        threads=bool(os.getenv("LONG_LIVED_ACCESS_TOKEN")),
        gcp=bool(os.getenv("GCP_PROJECT_ID") and os.getenv("GCP_CLIENT_EMAIL"))
    )

@app.post("/api/generate")
async def generate_content(request: GenerateRequest, db: firestore.Client = Depends(get_firestore)):
    """Generate content using AI and save to Firestore"""
    try:
        generator = ContentGenerator(model=request.model)
        results = []
        
        for i in range(request.count):
            if i == 0:
                text = generator.generate(request.prompt)
            else:
                text = generator.generate(
                    "위의 지침에 따라 새로운 게시글을 하나 더 작성해줘. (이전과 겹치지 않게)"
                )
            
            # Save to Firestore
            if request.save_to_firestore:
                post_data = {
                    "text": text,
                    "status": "pending",
                    "createdAt": firestore.SERVER_TIMESTAMP,
                    "model": request.model,
                    "language": "ko"
                }
                
                # Use multi-tenant path if org_id is provided
                if request.org_id and request.org_id != 'demo-org-id':
                    queue_ref = db.collection("orgs").document(request.org_id).collection("tools").document("threads").collection("queue")
                    doc_ref = queue_ref.add(post_data)
                else:
                    # Fallback to legacy queue for demo mode or missing org_id
                    doc_ref = db.collection("queue").add(post_data)
                    
                results.append({"id": doc_ref[1].id, "text": text[:100] + "..."})
            else:
                results.append({"text": text})
        
        return {
            "success": True,
            "message": f"{request.count}개의 콘텐츠가 생성되었습니다.",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate")
async def translate_content(request: TranslateRequest, db: firestore.Client = Depends(get_firestore)):
    """Translate content to target language"""
    try:
        generator = ContentGenerator(model=request.model)
        
        # Get pending content from Firestore
        if request.source_doc_ids:
            docs = [db.collection("queue").document(doc_id).get() for doc_id in request.source_doc_ids]
        else:
            docs = db.collection("queue").where("status", "==", "pending").where("language", "==", "ko").stream()
        
        lang_map = {
            "english": "English",
            "spanish": "Spanish",
        }
        
        target_lang = lang_map.get(request.target_lang, "English")
        translated_count = 0
        
        for doc in docs:
            if not doc.exists:
                continue
            
            data = doc.to_dict()
            text = data.get("text", "")
            
            if text:
                translated = generator.translate(text, target_lang)
                
                # Save translated version
                db.collection("queue").add({
                    "text": translated,
                    "status": "pending",
                    "createdAt": firestore.SERVER_TIMESTAMP,
                    "model": request.model,
                    "language": request.target_lang,
                    "original_id": doc.id
                })
                translated_count += 1
        
        return {
            "success": True,
            "message": f"{translated_count}개의 콘텐츠가 {target_lang}로 번역되었습니다."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/post")
async def post_to_threads(request: PostRequest, background_tasks: BackgroundTasks, db: firestore.Client = Depends(get_firestore)):
    """Start auto-posting to Threads"""
    try:
        # Get Threads config from Firestore for this organization
        config_ref = db.collection("orgs").document(request.org_id).collection("tools").document("threads").collection("config").document("main")
        config_doc = config_ref.get()
        
        if not config_doc.exists:
            raise HTTPException(status_code=400, detail="Threads API 설정이 없습니다. Settings에서 Access Token을 먼저 설정해주세요.")
        
        config = config_doc.to_dict()
        token = config.get("accessToken")
        
        if not token:
            raise HTTPException(status_code=400, detail="Access Token이 설정되지 않았습니다. Settings에서 설정해주세요.")
        
        threads_api = ThreadsAPI(token)
        user = threads_api.me()
        
        # Start background posting task
        background_tasks.add_task(
            auto_post_worker,
            threads_api,
            request.org_id,
            request.interval_minutes
        )
        
        return {
            "success": True,
            "message": f"자동 게시가 시작되었습니다. (@{user.get('username', 'N/A')})",
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def auto_post_worker(threads_api: ThreadsAPI, org_id: str, interval_minutes: int):
    """Background worker for auto-posting"""
    db = firestore.client()
    
    while True:
        try:
            # Get next pending post from organization's queue
            queue_ref = db.collection("orgs").document(org_id).collection("tools").document("threads").collection("queue")
            docs = queue_ref.where("status", "==", "pending").limit(1).stream()
            doc = next(docs, None)
            
            if not doc:
                print("No more posts in queue")
                break
            
            data = doc.to_dict()
            text = data.get("text", "")
            
            if text:
                # Post to Threads
                result = threads_api.post_text(text)
                
                # Update status in Firestore
                doc.reference.update({
                    "status": "posted" if result else "failed",
                    "postedAt": firestore.SERVER_TIMESTAMP,
                    "permalink": result.get("permalink") if result else None
                })
            
            # Wait for next interval
            time.sleep(interval_minutes * 60)
            
        except Exception as e:
            print(f"Error in auto_post_worker: {e}")
            time.sleep(60)

@app.get("/api/posts")
async def get_posts(status: Optional[str] = None, limit: int = 50, db: firestore.Client = Depends(get_firestore)):
    """Get posts from queue"""
    try:
        query = db.collection("queue")
        
        if status:
            query = query.where("status", "==", status)
        
        query = query.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(limit)
        
        posts = []
        for doc in query.stream():
            data = doc.to_dict()
            data["id"] = doc.id
            posts.append(data)
        
        return {"posts": posts, "count": len(posts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
