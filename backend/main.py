from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import whisper
import imageio_ffmpeg
import re
from collections import Counter
from deep_translator import GoogleTranslator

# Inject FFmpeg into the environment
os.environ["PATH"] += os.pathsep + os.path.dirname(imageio_ffmpeg.get_ffmpeg_exe())

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Local Whisper AI...")
model = whisper.load_model("base")
print("Local Whisper AI loaded!")

def _try_import_argos():
    try:
        import argostranslate.translate
        return argostranslate.translate
    except Exception:
        return None


def translate_text_local(text, source_lang, target_lang):
    if not text or not text.strip():
        return text
        
    # Mapping for common full names to codes just in case
    lang_map = {
        "english": "en", "hindi": "hi", "spanish": "es", "french": "fr", 
        "german": "de", "marathi": "mr", "gujarati": "gu", "bengali": "bn",
        "tamil": "ta", "telugu": "te", "kannada": "kn", "malayalam": "ml", "punjabi": "pa"
    }
    
    s_lang = lang_map.get(source_lang.lower(), source_lang)
    t_lang = lang_map.get(target_lang.lower(), target_lang)
    
    try:
        source = s_lang if s_lang and s_lang != "auto" else 'auto'
        translator = GoogleTranslator(source=source, target=t_lang)
        
        # Split text into chunks of 4500 characters to stay within Google's limit
        max_chunk = 4500
        if len(text) <= max_chunk:
            return translator.translate(text)
        
        # Chunked translation
        chunks = [text[i:i + max_chunk] for i in range(0, len(text), max_chunk)]
        translated_chunks = []
        for chunk in chunks:
            translated_chunks.append(translator.translate(chunk))
        
        return "".join(translated_chunks)
        
    except Exception as e:
        # Fallback to returning original text with a prefix if translation fails
        print(f"Translation error: {str(e)}")
        return f"[{t_lang.upper()}] {text}"


SEP = "\u2063\u2064\u2063"  # invisible separators unlikely to appear in speech text

def translate_batch(texts, source_lang, target_lang):
    """Translate a list of strings in ONE API call by joining with a unique separator.
    Falls back to original text on any error."""
    if not texts:
        return texts
    lang_map = {
        "english": "en", "hindi": "hi", "spanish": "es", "french": "fr",
        "german": "de", "marathi": "mr", "gujarati": "gu", "bengali": "bn",
        "tamil": "ta", "telugu": "te", "kannada": "kn", "malayalam": "ml", "punjabi": "pa"
    }
    s_lang = lang_map.get(source_lang.lower(), source_lang)
    t_lang = lang_map.get(target_lang.lower(), target_lang)
    joined = SEP.join(t if t and t.strip() else " " for t in texts)
    try:
        source = s_lang if s_lang and s_lang != "auto" else "auto"
        translator = GoogleTranslator(source=source, target=t_lang)
        # Keep chunks under 4500 chars
        if len(joined) <= 4500:
            translated = translator.translate(joined)
        else:
            parts = joined.split(SEP)
            out_parts = []
            buf = []
            buf_len = 0
            for p in parts:
                if buf_len + len(p) + len(SEP) > 4400:
                    chunk_text = SEP.join(buf)
                    out_parts.append(translator.translate(chunk_text))
                    buf = [p]
                    buf_len = len(p)
                else:
                    buf.append(p)
                    buf_len += len(p) + len(SEP)
            if buf:
                out_parts.append(translator.translate(SEP.join(buf)))
            translated = SEP.join(out_parts)
        result = translated.split(SEP)
        # Pad or trim to match original length
        while len(result) < len(texts):
            result.append(texts[len(result)])
        return result[:len(texts)]
    except Exception as e:
        print(f"Batch translation error: {str(e)}")
        return texts

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "en"
    target_lang: str

@app.post("/translate-text/")
async def translate_text_endpoint(request: TranslationRequest):
    try:
        translated_text = translate_text_local(request.text, request.source_lang, request.target_lang)
        return {
            "translated_text": translated_text,
            "source_lang": request.source_lang,
            "target_lang": request.target_lang
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )


def format_mmss(seconds):
    total = int(max(seconds or 0, 0))
    minutes = total // 60
    secs = total % 60
    return f"{minutes:02d}:{secs:02d}"


def build_timeline(result):
    raw_segments = result.get("segments", []) or []
    segments = []
    speaker_turns = []
    words = []

    speaker_index = 0
    last_end = None

    for idx, seg in enumerate(raw_segments):
        start = float(seg.get("start", 0.0) or 0.0)
        end = float(seg.get("end", start) or start)
        text = (seg.get("text") or "").strip()
        if not text:
            continue

        # Local heuristic speaker splitting: long pause likely indicates a new turn.
        if last_end is not None and start - last_end > 1.2:
            speaker_index += 1
        speaker_name = f"Speaker {chr(65 + (speaker_index % 3))}"

        segment_item = {
            "id": f"seg-{idx}",
            "speaker": speaker_name,
            "start": round(start, 2),
            "end": round(end, 2),
            "timestamp": format_mmss(start),
            "text": text,
        }
        segments.append(segment_item)

        speaker_turns.append({
            "id": f"turn-{idx}",
            "speaker": speaker_name,
            "start": round(start, 2),
            "end": round(end, 2),
            "timestamp": format_mmss(start),
            "text": text,
        })

        for word_idx, w in enumerate(seg.get("words", []) or []):
            w_start = float(w.get("start", start) or start)
            words.append({
                "id": f"w-{idx}-{word_idx}",
                "word": (w.get("word") or "").strip(),
                "start": round(w_start, 2),
                "end": round(float(w.get("end", w_start) or w_start), 2),
                "timestamp": format_mmss(w_start),
                "speaker": speaker_name,
            })

        last_end = end

    return {"segments": segments, "speaker_turns": speaker_turns, "words": words}

def generate_insights(text):
    if not text or len(text.strip()) < 10:
        return {"summary": ["No audio detected."], "mindmap": {"center": "Meeting", "nodes": []}}
    
    sentences = [s.strip() for s in re.split(r'(?<=[.?!])\s+', text) if len(s.strip()) > 5]
    if not sentences:
        sentences = [text]

    # Improved word filtering
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    
    # Expanded stopwords to filter out "junk" common words
    stopwords = {
        "that", "this", "with", "from", "your", "have", "what", "there", "will", "would", "could", "should", 
        "they", "them", "then", "than", "because", "about", "just", "like", "know", "think", "getting", 
        "take", "make", "went", "come", "going", "goes", "been", "being", "really", "very", "much", 
        "more", "most", "some", "other", "these", "those", "into", "onto", "under", "over", "again",
        "also", "than", "even", "only"
    }
    
    filtered_words = [w for w in words if w not in stopwords]
    word_counts = Counter(filtered_words)
    
    # 1. Summary logic stays the same but uses the better filtered words for scoring
    sentence_scores = {}
    for sentence in sentences:
        s_words = re.findall(r'\b[a-zA-Z]{4,}\b', sentence.lower())
        score = sum([word_counts[w] for w in s_words if w in word_counts])
        sentence_scores[sentence] = score / (len(s_words) + 1)
        
    top_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:3]
    summary = [s for s in sentences if s in top_sentences]
    if not summary:
        summary = sentences[:3]
        
    # 2. Mindmap - Dynamic Center and better branch selection
    top_keywords = [w for w, c in word_counts.most_common(5)]
    nodes = []
    
    center_topic = top_keywords[0].capitalize() if top_keywords else "Meeting"
    
    # Create branches from the next most frequent words
    for i, keyword in enumerate(top_keywords[1:4]): # Take up to 3 outer nodes
        color = ["cyan", "amber", "red"][i % 3]
        
        # For children, find words that appear in the same sentences as this keyword
        relevant_sentences = [s for s in sentences if keyword in s.lower()]
        sentence_text = " ".join(relevant_sentences)
        branch_words = re.findall(r'\b[a-zA-Z]{4,}\b', sentence_text.lower())
        branch_filtered = [w for w in branch_words if w not in stopwords and w != keyword and w != top_keywords[0]]
        branch_counts = Counter(branch_filtered)
        
        nodes.append({
            "label": keyword.capitalize(),
            "color": color,
            "children": [w.capitalize() for w, c in branch_counts.most_common(3)]
        })

    return {
        "summary": summary,
        "mindmap": {"center": center_topic, "nodes": nodes}
    }


def semantic_analysis(text, timeline_segments=None):
    if not text or len(text.strip()) < 10:
        return {
            "topics": [],
            "decisions": [],
            "action_items": [],
            "questions": [],
            "risks": [],
            "sentiment": {"overall": {"label": "Neutral", "score": 0}, "segments": []},
        }

    sentences = [s.strip() for s in re.split(r'(?<=[.?!])\s+', text) if len(s.strip()) > 3]

    action_markers = ("need to", "please", "let us", "lets", "we should", "i will", "we will", "follow up", "schedule", "send", "share")
    decision_markers = ("decided", "we agree", "agreed", "approved", "finalize", "confirmed", "locked", "conclude")
    risk_markers = ("risk", "blocker", "issue", "problem", "delay", "stuck", "concern", "unknown", "dependency")

    positive_words = {
        "good", "great", "excellent", "positive", "happy", "improve", "success", "clear", "love", "nice", "strong", "win"
    }
    negative_words = {
        "bad", "poor", "negative", "sad", "angry", "fail", "failure", "unclear", "confusing", "blocked", "risk", "problem", "issue"
    }

    def score_sentiment(s):
        tokens = re.findall(r"\b[a-zA-Z']+\b", (s or "").lower())
        pos = sum(1 for t in tokens if t in positive_words)
        neg = sum(1 for t in tokens if t in negative_words)
        return pos - neg

    def label_from_score(score):
        if score >= 2:
            return "Positive"
        if score <= -2:
            return "Negative"
        return "Neutral"

    action_items = []
    decisions = []
    questions = []
    risks = []

    for s in sentences:
        s_lower = s.lower()
        if "?" in s:
            questions.append(s)
        if any(m in s_lower for m in action_markers):
            action_items.append(s)
        if any(m in s_lower for m in decision_markers):
            decisions.append(s)
        if any(m in s_lower for m in risk_markers):
            risks.append(s)

    # Topics via most common meaningful words
    words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
    stop = {
        "that", "this", "with", "from", "your", "have", "what", "there", "will", "would", "could", "should",
        "they", "them", "then", "than", "because", "about", "just", "like", "know", "think", "getting",
        "take", "make", "went", "come", "going", "goes", "been", "being", "really", "very", "much",
        "more", "most", "some", "other", "these", "those", "into", "onto", "under", "over", "again",
        "also", "even", "only", "when", "where", "while", "meanwhile"
    }
    filtered = [w for w in words if w not in stop]
    topics = [w.capitalize() for w, _ in Counter(filtered).most_common(6)]

    overall_score = sum(score_sentiment(s) for s in sentences[:20])
    overall_label = label_from_score(overall_score)

    seg_sentiments = []
    if timeline_segments:
        for seg in timeline_segments[:12]:
            seg_score = score_sentiment(seg.get("text", ""))
            seg_sentiments.append({
                "timestamp": seg.get("timestamp", "00:00"),
                "label": label_from_score(seg_score),
                "score": seg_score
            })

    def uniq(items):
        seen = set()
        out = []
        for item in items:
            key = item.strip().lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(item)
        return out

    return {
        "topics": topics[:6],
        "decisions": uniq(decisions)[:5],
        "action_items": uniq(action_items)[:5],
        "questions": uniq(questions)[:5],
        "risks": uniq(risks)[:5],
        "sentiment": {
            "overall": {"label": overall_label, "score": overall_score},
            "segments": seg_sentiments
        }
    }

@app.get("/")
def home():
    return {"message": "Local Whisper Backend running successfully 🚀"}

@app.post("/transcribe/")
async def transcribe(
    file: UploadFile = File(...),
    mode: str = Form("transcribe"),
    target_lang: str = Form(""),
):
    file_location = f"temp_{file.filename}"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        task = "translate" if (mode or "").lower().strip() == "translate" else "transcribe"
        result = model.transcribe(file_location, task=task, word_timestamps=True, verbose=False)
        text = result["text"]
        detected_lang = (result.get("language") or "").lower().strip()
        target = (target_lang or "").lower().strip()
        # Determine source language for translation (fall back to 'auto' if detection failed)
        src_lang = detected_lang if detected_lang else "auto"
        # Translate if a target language is requested and it differs from the detected source
        # (or if detection failed, always attempt translation)
        should_translate = bool(target and task != "translate" and target != detected_lang)
        if should_translate:
            # --- BATCH translate: 1 API call for full text ---
            text = translate_text_local(text, src_lang, target)
        insights = generate_insights(text)
        timeline = build_timeline(result)
        if should_translate:
            # Batch translate all segments in ONE call (avoids 50+ sequential API calls)
            segs = timeline.get("segments", [])
            if segs:
                seg_texts = translate_batch([s.get("text", "") for s in segs], src_lang, target)
                for s, t in zip(segs, seg_texts):
                    s["text"] = t

            turns = timeline.get("speaker_turns", [])
            if turns:
                turn_texts = translate_batch([t.get("text", "") for t in turns], src_lang, target)
                for turn, translated in zip(turns, turn_texts):
                    turn["text"] = translated

            # Translate mindmap in one batch
            mm = insights.get("mindmap") or {}
            mm_labels = [mm.get("center", "")]
            for node in mm.get("nodes", []) or []:
                mm_labels.append(node.get("label", ""))
                mm_labels.extend(node.get("children") or [])
            if mm_labels:
                mm_translated = translate_batch(mm_labels, src_lang, target)
                idx = 0
                mm["center"] = mm_translated[idx]; idx += 1
                for node in mm.get("nodes", []) or []:
                    node["label"] = mm_translated[idx]; idx += 1
                    children = node.get("children") or []
                    node["children"] = mm_translated[idx:idx + len(children)]; idx += len(children)
            insights["mindmap"] = mm

            # Translate summary lines in one batch
            summary_lines = insights.get("summary") or []
            if summary_lines:
                insights["summary"] = translate_batch(summary_lines, src_lang, target)

        semantic = semantic_analysis(text, timeline.get("segments", []))
    except Exception as e:
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail=str(e))

    if os.path.exists(file_location):
        os.remove(file_location)

    return {
        "mode": task,
        "language": detected_lang if 'detected_lang' in locals() else "",
        "target_lang": (target_lang or "").lower().strip(),
        "text": text,
        "summary": insights["summary"],
        "mindmap": insights["mindmap"],
        "segments": timeline["segments"],
        "speaker_turns": timeline["speaker_turns"],
        "words": timeline["words"],
        "semantic": semantic,
    }