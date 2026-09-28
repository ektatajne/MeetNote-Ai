import whisper

import os
os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin" 
model = whisper.load_model("base")

audio_path = "AIAdvancement (1).wav"

result = model.transcribe(audio_path, verbose=True)

print("\nFull Transcription:\n")
print(result["text"])

print("\nTimestamps:\n")
for segment in result["segments"]:
    print(f"[{segment['start']:.2f}s - {segment['end']:.2f}s] {segment['text']}")

with open("transcription.txt", "w", encoding="utf-8") as f:
    f.write(result["text"])