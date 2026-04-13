# Project AI/ML Models & Algorithms

This document provides a detailed technical explanation of the Artificial Intelligence and Machine Learning models implemented in this project, including their theoretical basis, library implementation, and execution flow.

## 1. Recommendation Engine
**File:** `backend/recommender.py`

### Algorithm: Content-Based Filtering (TF-IDF + Cosine Similarity)
The recommendation system uses a **Content-Based Filtering** approach. This means it recommends items similar to those a user is currently viewing, based on the item's attributes (metadata). It does not rely on user purchase history (Collaborative Filtering), making it effective even without a large user base (solving the "Cold Start" problem).

### Key Components:
-   **TF-IDF (Term Frequency-Inverse Document Frequency):** Used to convert text data into numerical vectors.
-   **Cosine Similarity:** Used to measure the angle between two vectors (products). A smaller angle (value closer to 1) means higher similarity.

### Execution Flow:
1.  **Data Preparation ("Soup"):** The system combines multiple attributes of a product into a single string called "soup".
    *   *Features used:* Category, Material, Style, Color, Gender, Occasion, Product Name.
2.  **Vectorization:**
    *   `TfidfVectorizer` (from `sklearn`) converts this "soup" into a sparse matrix.
    *   It weighs unique terms higher (e.g., specific materials like "Platinum") and common terms lower (e.g., "Jewelry").
3.  **Similarity Calculation:**
    *   When a product SKU is queried, the system locates its vector.
    *   It calculates the **Linear Kernel** (dot product, equivalent to Cosine Similarity for normalized vectors) between this product and all others.
4.  **Ranking:**
    *   Products are sorted by their similarity score.
    *   The top `N` (default 5) products are returned as recommendations.

### How to Check Accuracy:
Since this is an unsupervised content-based system without historical user data, standard metrics like RMSE don't apply directly.
1.  **Subjective Evaluation (Eye Test):**
    *   Pick a product (e.g., "Gold Wedding Ring").
    *   Run `reco.get_recommendations("SKU_OF_RING")`.
    *   *Pass Criteria:* The top 5 results should be *other* rings or wedding-related items (e.g., matching earrings), not unrelated items like "Silver Anklet".
2.  **Diversity Metric:** Ensure recommendations aren't identical duplicate products.


---

## 2. Demand Forecasting
**File:** `backend/forecaster.py`

### Algorithm: SARIMA (Seasonal AutoRegressive Integrated Moving Average)
The forecasting module uses **SARIMA**, a classic statistical model for time-series forecasting. It is well-suited for understanding trends and seasonality in sales data without requiring deep learning (like LSTMs). We use SARIMA specifically to capture recurring periodic patterns (e.g., weekly or monthly sales cycles).

### Model Parameters: `SARIMAX(order=(1, 1, 0), seasonal_order=(1, 1, 0, s))`
*   **AR (AutoRegressive) `p=1`:** Uses the relationship between an observation and a specified number of lagged observations.
*   **I (Integrated) `d=1`:** The data is differenced once to make it stationary (removing baseline linear trends).
*   **MA (Moving Average) `q=0`:** No moving average smoothing is applied.
*   **Seasonal Period `s`:** Automatically detected as `7` (Daily) or `12` (Monthly) based on the dataset structure.

### Execution Flow:
1.  **Data Aggregation:** Sales data is grouped by `Date` to get daily `Quantity_Sold`.
2.  **Frequency Detection:** The system detects if the data is logged daily or monthly to assign the `s` period dynamically.
3.  **Stationarity Check & Seasonality:** Handled by the `d=1` parameter and the `seasonal_order`.
4.  **Training:** The model fits on the historical timeline of sales.
5.  **Fallback Protection:** If data is insufficient for seasonality (< 14 days for a weekly cycle), it zeroes out the seasonal parameters to prevent optimization crashes. If data is extremely sparse (< 3 points), it returns only history without a forecast.

### How to Check Accuracy:
1.  **Backtesting (Time-Series Split):**
    *   Hide the last 7 days of sales data from the model.
    *   Train on the remaining past data.
    *   Forecast the hidden 7 days.
    *   Compare `Predicted` vs `Actual` values.
2.  **Metrics:**
    *   **MAE (Mean Absolute Error):** Average of `|Predicted - Actual|`. Lower is better.
    *   **MAPE (Mean Absolute Percentage Error):** Average percentage error.


---

## 3. Face Authentication
**File:** `backend/face_auth.py`

### Algorithm: FaceNet (Inception Resnet V1)
The system uses a Deep Learning approach for biometric authentication, specifically the **FaceNet** architecture implemented via PyTorch.

### Key Components:
1.  **MTCNN (Multi-task Cascaded Convolutional Networks):**
    *   Used for **Face Detection**. It scans the image to locate a face and crops it to a standard size (160x160 pixels).
2.  **InceptionResnetV1 (Pretrained on VGGFace2):**
    *   Used for **Feature Extraction**. It converts the cropped face image into a **512-dimensional vector (embedding)**.
    *   These embeddings represent the unique features of a face in a Euclidean space where distances correspond to face similarity.

### Execution Flow:
*   **Registration (`/face/register`):**
    1.  User uploads an image + Name.
    2.  MTCNN detects/crops the face.
    3.  InceptionResnetV1 generates the embedding.
    4.  Embedding is saved to `faces.json` mapped to the user's name.
*   **Authentication (`/face/recognize`):**
    1.  User uploads a login image.
    2.  System generates embedding for the login image.
    3.  **Cosine Similarity** is calculated against all stored user embeddings.
    4.  If the highest similarity score > **Threshold (0.6)**, access is granted.

### How to Check Accuracy:
1.  **LFW (Labeled Faces in the Wild) Benchmark:**
    *   The underlying `InceptionResnetV1` model claims ~99.6% accuracy on the LFW dataset.
2.  **Practical Threshold Tuning:**
    *   **False Acceptance Rate (FAR):** Test with a person *not* registered. If they are logged in, the system is too lenient (Threshold too low).
    *   **False Rejection Rate (FRR):** Test with a registered person using different lighting or angles. If they are denied, the system is too strict (Threshold too high).
    *   *Test:* Register yourself. Try to login with your photo (Should Match). Try to login with a friend's photo or a celebrity photo (Should Fail).


---

## 4. RAG Chatbot (Retrieval-Augmented Generation)
**File:** `backend/rag_engine.py`

### Algorithm: Semantic Search + Template-Based Generation
This module implements a **RAG** architecture but uses a lightweight, local approach ("Small Language Model" logic) instead of a heavy external LLM (like GPT-4). This ensures privacy, speed, and offline capability.

### Key Components:
1.  **Sentence Transformers (`all-MiniLM-L6-v2`):**
    *   A highly efficient Hugging Face model optimized for semantic similarity.
    *   It converts sentences (product descriptions, user queries) into **384-dimensional dense vectors**.
2.  **Semantic Search:**
    *   Unlike keyword search, this finds matches based on *meaning*.
    *   Example: Query "neckwear for bride" matches Product "Gold Necklace for Wedding" even if exact words differ.

### Execution Flow:
1.  **Indexing:**
    *   On startup, rich descriptions are created for all products (mixing Name, Material, Category, Occasion).
    *   `SentenceTransformer` encodes these into embeddings (cached in `embeddings.npy`).
2.  **Retrieval:**
    *   User Query -> Encoded to Vector.
    *   Cosine Similarity finds top 4 most relevant products.
3.  **Generation (The "G" in RAG):**
    *   Instead of a nondeterministic LLM, the system uses **Logic Templates**.
    *   It analyzes the retrieved products (e.g., price range, materials).
    *   It constructs a natural language sentence dynamically:
        *   *Template:* "I found [Product Name], crafted from [Material]..."
        *   *Suggestion logic:* If "Wedding" is in metadata -> "It would be perfect for your special day."

### How to Check Accuracy:
1.  **Retrieval Accuracy (Recall@K):**
    *   Query: "Red ruby necklace".
    *   *Check:* Do the top 4 returned products actually contain rubies and are necklaces?
2.  **Response Relevance:**
    *   *Check:* Does the generated text mention the price and material correctly?
    *   *Test:* Ask "How much is the gold ring?". Verify the bot extracts the price of the *specific* gold ring retrieved.


---

## 5. Voice Agent Integration
**File:** `backend/voice_agent.py`

### Architecture: Pipeline Integration
The voice agent is an interface layer that connects audio input/output with the RAG engine.

### Workflow:
1.  **Input:**
    *   **Telephony (Twilio):** User speaks -> Twilio converts Speech-to-Text -> Sends text to webhook.
    *   **Web (Browser):** Browser Web Speech API converts Speech-to-Text -> Sends text to API.
2.  **Processing:**
    *   The text is passed to the `RAGEngine.process_query()` method (described above).
3.  **Output:**
    *   **Telephony:** Returned as TwiML `<Say>` tag for Twilio's Text-to-Speech engine.
    *   **Web:** Text returned to frontend for browser `speechSynthesis` playback.

### How to Check Accuracy:
1.  **Word Error Rate (WER):**
    *   Speak a sentence clearly. Compare the text transcribed by the browser/Twilio vs what you said.
2.  **Latency:**
    *   Measure time from "Stop Speaking" to "Audio Response Start". < 2 seconds is good for voice.
3.  **End-to-End Test:**
    *   Say "I want a diamond ring".
    *   *Pass:* Audio response should be "I found a diamond ring..." and not "I didn't understand."

