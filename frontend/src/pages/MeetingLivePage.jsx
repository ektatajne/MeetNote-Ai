import { useState, useRef, useEffect } from "react";
import MeetingHistorySidebar from "../components/layout/MeetingHistorySidebar";

export default function MeetingLivePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (mediaRecorderRef.current && isRecording) {
        stopRecording();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for level monitoring
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start audio level monitoring
      monitorAudioLevel();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      setAudioLevel(0);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkLevel = () => {
      if (!isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationRef.current = requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0F1117] overflow-hidden">
      <MeetingHistorySidebar />

      <main className="flex-1 min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden bg-gradient-to-b from-[#0F1117] via-[#121527] to-[#0F1117]">
        <div className="flex items-center justify-center w-full h-full">
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

        <div className="w-full max-w-2xl rounded-3xl border border-[#2a2545] bg-[#13111c]/90 backdrop-blur-xl p-8 sm:p-10 text-center shadow-2xl relative z-10 mx-auto">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff5f56]/20 border border-[#ff5f56]/40 text-3xl mb-6 shadow-[0_0_30px_rgba(255,95,86,0.2)]">
            📡
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">Live URL</h1>
          <p className="text-sm sm:text-base text-[#9d99c0] mb-8 max-w-lg mx-auto leading-relaxed">
            Join or paste a live session link. Real-time transcription and analysis will appear here once integrated.
          </p>

          <div className="border-t border-[#2a2545] pt-8">
            <div className="text-center">
              <h2 className="text-lg font-bold text-white mb-6">Audio Recording</h2>
              
              {isRecording && (
                <div className="mb-8 space-y-4">
                  <div className="flex items-center justify-center space-x-3 bg-[#16132a] border border-[#2a2545] py-3 px-6 rounded-2xl w-max mx-auto">
                    <div className="w-3 h-3 bg-[#ff5f56] rounded-full animate-pulse shadow-[0_0_10px_#ff5f56]"></div>
                    <span className="text-[#ff5f56] font-bold uppercase tracking-widest text-xs">Recording</span>
                    <span className="text-white font-mono text-lg">{formatTime(recordingTime)}</span>
                  </div>
                  
                  <div className="w-full max-w-md mx-auto">
                    <div className="h-4 bg-[#16132a] rounded-full overflow-hidden border border-[#2a2545] p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#6D5FD5] to-[#26c6b9] rounded-full transition-all duration-100 shadow-[0_0_15px_rgba(109,95,213,0.5)]"
                        style={{ width: `${audioLevel * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="group relative inline-flex items-center px-8 py-4 bg-[#6D5FD5] text-white rounded-2xl hover:bg-[#5e50cb] transition-all duration-300 font-bold text-base shadow-lg shadow-[#6D5FD5]/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8"/>
                    </svg>
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="group relative inline-flex items-center px-8 py-4 bg-[#ff5f56] text-white rounded-2xl hover:bg-[#e63946] transition-all duration-300 font-bold text-base shadow-lg shadow-[#ff5f56]/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="6" y="6" width="8" height="8"/>
                    </svg>
                    Stop Recording
                  </button>
                )}
              </div>

              <p className="text-[13px] text-[#5e5a80] mt-6 leading-relaxed">
                Click "Start Recording" to begin capturing audio.<br />
                The recording will be saved as a WebM file when you stop.
              </p>
            </div>
          </div>
        </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(109,95,213,0.22),transparent_52%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(38,198,185,0.08),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(109,95,213,0.10),transparent_50%)]" />
        </div>
      </main>
    </div>
  );
}
