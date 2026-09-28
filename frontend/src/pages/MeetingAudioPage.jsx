import { useEffect, useRef, useState } from "react";
import MeetingAnalysisView from "./MeetingAnalysisView";
import MeetingHistorySidebar from "../components/layout/MeetingHistorySidebar";
import useTranscription from "../hooks/useTranscription";
import { checkBackendHealth } from "../services/whisperService";

export default function MeetingAudioPage() {
  const inputRef = useRef(null);
  const [audioName, setAudioName] = useState("");
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const [localStatusMessage, setLocalStatusMessage] = useState("");
  const [targetLang, setTargetLang] = useState("hi");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslationOptions, setShowTranslationOptions] = useState(false);
  const [translationStatus, setTranslationStatus] = useState("");
  const { result, loading, error, transcribeFile } = useTranscription();

  useEffect(() => {
    return () => {
      if (audioPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    if (!selectedFile || !selectedFile.type.startsWith("audio/")) return;

    if (audioPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(audioPreviewUrl);
    }

    setAudioName(selectedFile.name);
    setShowTranslationOptions(false);
    setSelectedAudioFile(selectedFile);
    setAudioPreviewUrl(URL.createObjectURL(selectedFile));
    setLocalStatusMessage("");
  };

  const runBackendJob = async (requestedMode, options = {}) => {
    if (!selectedAudioFile) return false;
    setLocalStatusMessage("Checking local backend...");

    const health = await checkBackendHealth();
    if (!health) {
      setLocalStatusMessage("Backend is offline. Start `python -m uvicorn main:app --host 127.0.0.1 --port 8000` and try again.");
      return false;
    }

    setLocalStatusMessage(requestedMode === "translate" ? "Backend connected. Translating audio..." : "Backend connected. Processing audio...");
    await transcribeFile(selectedAudioFile, { mode: requestedMode, ...options });
    return true;
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    setTranslationStatus("Preparing translation...");
    
    try {
      // Get language name for display
      const languageNames = {
        'en': 'English', 'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
        'mr': 'Marathi', 'gu': 'Gujarati', 'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu',
        'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi', 'zh': 'Chinese', 'ja': 'Japanese',
        'ko': 'Korean', 'ar': 'Arabic', 'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'nl': 'Dutch'
      };
      
      const langName = languageNames[targetLang] || targetLang;
      setTranslationStatus(`Translating to ${langName}...`);
      
      // For translation: transcribe original, then translate text in backend
      await runBackendJob("transcribe", { target_lang: targetLang });
      setTranslationStatus(`Translation to ${langName} completed!`);
    } catch (error) {
      setTranslationStatus("Translation failed. Please try again.");
      console.error('Translation error:', error);
    } finally {
      setTimeout(() => {
        setIsTranslating(false);
        setTranslationStatus("");
      }, 2000);
    }
  };

  const handleStartTranscription = async () => {
    await runBackendJob("transcribe");
  };

  
  if (result?.text && !result.text.startsWith("Error:")) {
    return <MeetingAnalysisView sourceAudioName={audioName} analysisResult={result} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0F1117]">
      <MeetingHistorySidebar />

      <main className="flex-1 min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden bg-gradient-to-b from-[#0F1117] via-[#121527] to-[#0F1117]">
        {/* Local Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#2a2545] bg-[#16132a] text-[#9d99c0] hover:text-[#e8e4ff] hover:border-[#6D5FD5]/50 transition-all shadow-md"
            title="Back to Dashboard"
          >
            <span className="text-xl leading-none">←</span>
          </button>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(109,95,213,0.22),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(38,198,185,0.08),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(109,95,213,0.10),transparent_50%)]" />
        </div>

        <input ref={inputRef} type="file" accept="audio/*" className="sr-only" onChange={handleFileSelect} />

        <div className="w-full max-w-2xl rounded-3xl border border-[#2a2545] bg-[#13111c]/90 backdrop-blur-xl p-8 sm:p-10 text-center shadow-2xl relative z-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6D5FD5]/20 border border-[#6D5FD5]/40 text-3xl mb-6 shadow-[0_0_30px_rgba(109,95,213,0.2)]">
            🎧
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">Upload audio to start analysis</h1>
          <p className="text-sm sm:text-base text-[#9d99c0] mb-8 max-w-lg mx-auto leading-relaxed">
            Choose a meeting recording. MeetNote AI transcribes it using your backend and then opens the analysis workspace.
          </p>

          {!loading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className={`w-full max-w-md mx-auto group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#2a2545] bg-[#16132a]/50 px-6 py-8 transition-all hover:bg-[#6D5FD5]/10 hover:border-[#6D5FD5]/50 cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="h-12 w-12 rounded-full bg-[#6D5FD5] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-[#e8e4ff]">Select Audio File</span>
              <span className="text-xs text-[#5e5a80]">MP3, WAV, or M4A</span>
            </button>
          )}

          {selectedAudioFile && audioPreviewUrl && (
            <div className="mt-8 rounded-2xl border border-[#2a2545] bg-[#16132a] p-5 text-left relative shadow-inner">
              <p className="text-[15px] font-bold text-white truncate pr-20">{audioName}</p>
              <p className="text-[11px] text-[#9d99c0] mt-1.5 uppercase tracking-wider font-semibold">{(selectedAudioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              <audio controls className="w-full mt-4 h-10 custom-audio" src={audioPreviewUrl} />

              {/* Translation controls */}
              {!loading && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {!showTranslationOptions ? (
                    <button
                      type="button"
                      onClick={() => setShowTranslationOptions(true)}
                      className="text-[11px] font-semibold rounded-xl border border-[#2a2545] bg-[#16132a] text-[#9d99c0] hover:text-white hover:border-[#6D5FD5]/50 transition-all px-4 py-2 flex items-center gap-2 shadow-lg"
                    >
                      <svg className="w-3.5 h-3.5 text-[#6D5FD5]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                      </svg>
                      Translate
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#13111c] border border-[#6D5FD5]/30 rounded-xl p-1 shadow-2xl animate-in fade-in zoom-in duration-200">
                      <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="text-[11px] font-medium bg-transparent border-none text-[#e8e4ff] focus:ring-0 cursor-pointer min-w-[100px]"
                        title="Choose target language"
                      >
                        <optgroup label="Popular Languages">
                          <option value="hi">🇮🇳 Hindi</option>
                          <option value="es">🇪🇸 Spanish</option>
                          <option value="fr">🇫🇷 French</option>
                          <option value="de">🇩🇪 German</option>
                          <option value="en">🇺🇸 English</option>
                        </optgroup>
                        <optgroup label="Indian Languages">
                          <option value="mr">🇮🇳 Marathi</option>
                          <option value="gu">🇮🇳 Gujarati</option>
                          <option value="bn">🇮🇳 Bengali</option>
                          <option value="ta">🇮🇳 Tamil</option>
                          <option value="te">🇮🇳 Telugu</option>
                          <option value="kn">🇮🇳 Kannada</option>
                          <option value="ml">🇮🇳 Malayalam</option>
                          <option value="pa">🇮🇳 Punjabi</option>
                        </optgroup>
                        <optgroup label="Asian Languages">
                          <option value="zh">🇨🇳 Chinese</option>
                          <option value="ja">🇯🇵 Japanese</option>
                          <option value="ko">🇰🇷 Korean</option>
                          <option value="ar">🇸🇦 Arabic</option>
                        </optgroup>
                        <optgroup label="European Languages">
                          <option value="it">🇮🇹 Italian</option>
                          <option value="pt">🇵🇹 Portuguese</option>
                          <option value="ru">🇷🇺 Russian</option>
                          <option value="nl">🇳🇱 Dutch</option>
                        </optgroup>
                      </select>
                      <button
                        type="button"
                        onClick={handleTranslate}
                        disabled={isTranslating || loading}
                        className={`text-[11px] font-semibold rounded-lg border transition px-4 py-2 flex items-center gap-2 ${
                          isTranslating || loading
                            ? 'border-[#2a2545] bg-[#16132a] text-[#5e5a80] cursor-not-allowed'
                            : 'border-[#6D5FD5]/50 bg-[#6D5FD5] hover:bg-[#5e50cb] text-white shadow-lg shadow-[#6D5FD5]/20'
                        }`}
                      >
                        {isTranslating ? (
                          <>
                            <svg className="w-3 h-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Wait...
                          </>
                        ) : (
                          'Go'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}


            {!loading && (
              <button
                type="button"
                onClick={handleStartTranscription}
                className="mt-4 w-full rounded-lg bg-[#6D5FD5] hover:bg-[#5e50cb] transition py-2.5 text-sm font-semibold text-white"
              >
                Start Transcription
              </button>
            )}

            {localStatusMessage && (
              <p className="mt-3 text-xs text-[#9d99c0]">{localStatusMessage}</p>
            )}

            {translationStatus && (
              <div className={`mt-3 p-2 rounded-lg text-xs ${
                translationStatus.includes('completed') 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
                  : translationStatus.includes('failed')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                  : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
              }`}>
                <div className="flex items-center gap-2">
                  {translationStatus.includes('Translating') && (
                    <svg className="w-3 h-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  )}
                  {translationStatus.includes('completed') && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {translationStatus.includes('failed') && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{translationStatus}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="mt-8 text-left rounded-xl border border-[#2a2545] bg-[#16132a] p-4">
            <p className="text-sm font-semibold text-[#e8e4ff]">Processing: {audioName}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#26c6b9]" />
                <span className="text-[#e8e4ff]">Uploading audio file</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6D5FD5] animate-pulse" />
                <span className="text-[#e8e4ff]">Transcribing and generating insights</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5e5a80]" />
                <span className="text-[#9d99c0]">Preparing analysis workspace</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
