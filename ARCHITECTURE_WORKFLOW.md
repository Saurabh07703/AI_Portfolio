# AI Jewelry Recommendation & Forecasting System
## Architecture & Workflow Diagrams

> **Purpose**: This document provides a visual and structured breakdown of the entire system—its high-level architecture, individual model workflows, and data flows. It is designed to complement `INTERVIEW_GUIDE.md` and `PROJECT_MODELS.md` for technical interview preparation.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Frontend (React 19 + Vite)"]
        UI[Product Listing UI]
        FaceUI[Face Auth Component]
        ChatUI[Chatbot Component]
        VoiceUI[Voice Interface]
        ForecastUI[Forecast Dashboard]
    end

    subgraph GATEWAY["⚡ API Gateway (FastAPI / Python)"]
        MainAPI[main.py\nFastAPI App]
    end

    subgraph MODELS["🧠 AI/ML Engine Layer"]
        FaceModule[face_auth.py\nFaceNet + MTCNN]
        RecoModule[recommender.py\nTF-IDF + Cosine Sim]
        RAGModule[rag_engine.py\nSentence Transformers]
        ForecastModule[forecaster.py\nARIMA Model]
        VoiceModule[voice_agent.py\nPipeline Orchestrator]
    end

    subgraph STORAGE["💾 Storage Layer"]
        CSV[(jewelry_combined.csv\nProduct + Sales Data)]
        FaceDB[(faces.json\nUser Embeddings)]
        EmbCache[(embeddings.npy\nCached RAG Vectors)]
        Firebase[(Firebase Firestore\nUser Auth + Orders)]
    end

    subgraph EXTERNAL["🌐 External Services"]
        Twilio[Twilio\nVoice/SMS]
        WebSpeech[Browser\nWeb Speech API]
    end

    FaceUI -->|Image Upload| MainAPI
    ChatUI -->|Text Query| MainAPI
    VoiceUI -->|STT Text| MainAPI
    UI -->|Product SKU| MainAPI
    ForecastUI -->|Date Range| MainAPI

    MainAPI --> FaceModule
    MainAPI --> RecoModule
    MainAPI --> RAGModule
    MainAPI --> ForecastModule
    MainAPI --> VoiceModule

    FaceModule <--> FaceDB
    RecoModule <--> CSV
    RAGModule <--> EmbCache
    RAGModule <--> CSV
    ForecastModule <--> CSV

    VoiceModule --> RAGModule
    VoiceModule <--> Twilio
    VoiceUI <--> WebSpeech

    CLIENT <--> Firebase
```

---

## 2. Face Authentication Workflow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as FastAPI /face/*
    participant MTCNN as MTCNN (Face Detector)
    participant FaceNet as InceptionResnetV1
    participant DB as faces.json

    Note over User, DB: --- REGISTRATION FLOW ---
    User->>Frontend: Capture webcam image + enter name
    Frontend->>API: POST /face/register (image, name)
    API->>MTCNN: Detect & crop face (160×160px)
    MTCNN-->>API: Cropped face tensor
    API->>FaceNet: Generate 512-dim embedding
    FaceNet-->>API: Embedding vector
    API->>DB: Save {name: embedding}
    API-->>Frontend: {"status": "registered"}

    Note over User, DB: --- AUTHENTICATION FLOW ---
    User->>Frontend: Capture login image
    Frontend->>API: POST /face/recognize (image)
    API->>MTCNN: Detect & crop face
    MTCNN-->>API: Cropped face tensor
    API->>FaceNet: Generate 512-dim embedding
    FaceNet-->>API: Login embedding vector
    API->>DB: Load all stored embeddings
    API->>API: Cosine Similarity(login_emb, all_embeddings)
    alt Similarity > 0.6 (Threshold)
        API-->>Frontend: {"user": "Saurabh", "match": true}
        Frontend->>User: ✅ Access Granted
    else Similarity ≤ 0.6
        API-->>Frontend: {"match": false}
        Frontend->>User: ❌ Access Denied
    end
```

---

## 3. Recommendation Engine Workflow

```mermaid
flowchart TD
    A([📦 Product CSV Loaded\non App Startup]) --> B

    subgraph OFFLINE["⚙️ Build Phase (One-time)"]
        B[Create 'Soup' string per product\ne.g., 'Gold Ring Wedding Female'] --> C
        C[TF-IDF Vectorizer\nFit on all soups] --> D
        D[Sparse TF-IDF Matrix\nShape: n_products × vocab_size]
    end

    subgraph ONLINE["🔄 Request Phase (Per API Call)"]
        E([User views Product SKU]) --> F
        F[Look up product row index] --> G
        G[Extract its TF-IDF row vector] --> H
        H[Compute Linear Kernel\nwith all other product vectors] --> I
        I[Sort by score descending] --> J
        J[Return top 5 SKUs] --> K
        K([🛍️ Similar Products shown in UI])
    end

    D -.->|Reused for every request| H
```

---

## 4. RAG Chatbot Workflow

```mermaid
flowchart LR
    subgraph INDEXING["📚 Indexing (Startup)"]
        A[Load all products from CSV] --> B
        B[Build rich description per product:\nName + Material + Category + Occasion] --> C
        C[SentenceTransformer\nall-MiniLM-L6-v2\nEncode all descriptions] --> D
        D[(embeddings.npy\nCached 384-dim vectors)]
    end

    subgraph RETRIEVAL["🔍 Retrieval (Per Query)"]
        E([User types/speaks query]) --> F
        F[SentenceTransformer\nEncode query → vector] --> G
        G[Cosine Similarity\nvs all cached embeddings] --> H
        H[Top 4 most relevant\nproducts retrieved]
    end

    subgraph GENERATION["✍️ Generation (Template Engine)"]
        H --> I{Analyze metadata\nof retrieved products}
        I --> J[Check price range,\nmaterials, occasions]
        J --> K[Fill Logic Template:\n'I found {Name} crafted\nfrom {Material}...']
        K --> L{Occasion detected?}
        L -->|Wedding| M[Append: 'Perfect for your\nspecial day!']
        L -->|No special| N[Append: 'Here are\nyour top picks!']
        M & N --> O([📩 Natural language\nresponse + product cards])
    end

    D -.->|Loaded once| G
```

---

## 5. Demand Forecasting Workflow

```mermaid
flowchart TD
    A([📊 Sales Data CSV]) --> B
    B[Aggregate by Date\nGet daily Quantity_Sold] --> C
    C{Enough data?\n≥ 3 data points}

    C -->|No| D([Return only\nhistorical data])
    C -->|Yes| E

    subgraph ARIMA_FLOW["📈 ARIMA(1,1,0) Modeling"]
        E[Apply differencing d=1\nRemove trend → Stationary series] --> F
        F[Fit AR1 model:\nToday = α × Yesterday + error] --> G
        G[Forecast next N days\ndefault N=6]
    end

    G --> H[Merge historical + forecast] --> I
    I([📉 Chart: Historical sales\n+ Predicted trend line])
```

---

## 6. Voice Agent Pipeline

```mermaid
flowchart LR
    subgraph WEB_CHANNEL["🌐 Web Browser Channel"]
        A1([User speaks]) --> B1[Web Speech API\nSpeech-to-Text]
        B1 --> C1[Text string]
    end

    subgraph PHONE_CHANNEL["📞 Telephony Channel (Twilio)"]
        A2([User calls number]) --> B2[Twilio\nSpeech-to-Text]
        B2 --> C2[Text via Webhook POST]
    end

    C1 & C2 --> D

    subgraph BACKEND["⚙️ Backend Processing"]
        D[voice_agent.py\nroutes query] --> E
        E[RAGEngine.process_query\nRetrieve + Generate]
        E --> F{Channel?}
    end

    F -->|Web| G[Return JSON text\nto React frontend]
    F -->|Phone| H[Wrap in TwiML\n'<Say>response</Say>']

    G --> I([Browser\nspeechSynthesis\nText-to-Speech])
    H --> J([Twilio reads response\naloud on the call])
```

---

## 7. Full User Journey (End-to-End)

```mermaid
journey
    title A User's Full Journey Through the Platform
    section Onboarding
      Land on Homepage: 5: User
      Register Face (webcam capture): 4: User, System
      Face Embedding Saved: 5: System
    section Authentication
      Return to site: 5: User
      Face Login (webcam): 4: User
      Identity Matched (Cosine Sim > 0.6): 5: System
    section Shopping
      Browse product catalog: 5: User
      View product detail: 5: User
      See AI Recommendations (TF-IDF): 5: System
      Add item to cart: 5: User
    section Discovery (Chatbot)
      Type 'Show me gold wedding rings': 5: User
      RAG retrieves top 4 products: 5: System
      Template response generated: 5: System
      User sees product cards + text: 5: User
    section Voice Interaction
      Speak query via microphone: 4: User
      STT converts to text: 4: System
      RAG processes query: 5: System
      TTS speaks response: 5: System
    section Business Intelligence
      Admin views Forecast Dashboard: 5: User
      ARIMA predicts next 6 days sales: 5: System
```

---

## 8. Technology Stack Summary

| Layer | Technology | Why Chosen |
|---|---|---|
| **Frontend** | React 19 + Vite | Component-based UI, fast HMR dev experience |
| **Backend** | FastAPI (Python) | Async, auto-validation (Pydantic), Swagger docs |
| **Face Detection** | MTCNN | Fast, accurate multi-stage face cropping |
| **Face Embedding** | InceptionResnetV1 (VGGFace2) | 99.6% LFW accuracy, 512-dim robust embeddings |
| **Recommendation** | TF-IDF + Cosine Similarity | No training data needed, solves Cold Start |
| **Semantic Search** | `all-MiniLM-L6-v2` | 6× faster than BERT, 384-dim, offline |
| **Forecasting** | ARIMA(1,1,0) | Interpretable, lightweight for small datasets |
| **Voice (Web)** | Web Speech API | Zero-latency, browser-native, no API cost |
| **Voice (Phone)** | Twilio + TwiML | Production-grade telephony integration |
| **Auth / DB** | Firebase Firestore | Scalable NoSQL, real-time, built-in auth |
| **Deployment** | Hugging Face Spaces + Vercel | Free-tier friendly, Docker support |

---

## 9. Key Design Decisions (Interview Talking Points)

### ❓ Why no OpenAI/ChatGPT?
> **Answer**: Cost, latency, and privacy. Using local `sentence-transformers` gives **zero API cost**, **<50ms retrieval**, and **no data leaves the server**. The Template Engine replaces hallucination-prone LLMs with deterministic, verifiable output.

### ❓ Why Content-Based over Collaborative Filtering?
> **Answer**: Collaborative Filtering requires a large history of user-item interactions. A new product or new user gets no recommendations (**Cold Start Problem**). Content-Based works from day one using only product metadata.

### ❓ How would you scale this?
> **Answer**: Replace the in-memory NumPy cosine search with **FAISS** or **Pinecone** (vector DB) for O(log n) retrieval. Replace ARIMA with **Prophet** or **LSTM** for non-linear trend capture. Add a Redis cache for hot product embeddings.

### ❓ What is the threshold of 0.6 in Face Auth?
> **Answer**: It was empirically tuned. Below 0.6 = too many False Accepts (security risk). Above ~0.7 = too many False Rejects (bad UX, especially with lighting changes). 0.6 balances FAR vs FRR for a demo environment.
