import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-meet-line bg-meet-input text-meet-text placeholder:text-meet-muted " +
    "focus:outline-none focus:ring-2 focus:ring-[rgba(109,95,213,0.45)] focus:border-meet-purple transition";

  return (
    <div className="min-h-screen w-full flex overflow-hidden font-sans bg-meet-bg text-meet-text">
      {/* LEFT */}
      <div className="hidden lg:flex flex-col w-[55%] bg-meet-bg relative overflow-hidden justify-between border-r border-meet-line">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(109,95,213,0.25)_0%,transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

        <div className="p-12 relative z-10">
          <div className="flex items-center text-meet-text font-bold text-2xl tracking-wide">
            MeetNote AI
            <span className="w-2.5 h-2.5 rounded-full bg-meet-purple ml-2 animate-pulse shadow-[0_0_12px_rgba(109,95,213,0.8)]" />
          </div>

          <div className="mt-32 max-w-lg">
            <h1 className="text-5xl font-extrabold text-meet-text leading-[1.1] tracking-tight">
              Every voice
              <br />
              deserves to be
              <br />
              <span className="text-meet-purpleLight">heard.</span>
            </h1>
            <p className="mt-6 text-meet-muted text-lg leading-relaxed max-w-md">
              AI-powered meeting transcription designed for everyone — including those the world often forgets.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {["🎙️ Live Transcription", "🧏 DEI Accessible", "🧠 AI Summaries", "📧 Auto Email"].map((label) => (
                <span
                  key={label}
                  className="flex items-center bg-meet-input border border-[rgba(109,95,213,0.3)] text-meet-muted px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="h-32 w-full flex items-end justify-center space-x-1 p-8 relative z-10 bottom-0 opacity-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-meet-purple rounded-t-sm"
              style={{
                height: `${20 + Math.random() * 80}%`,
                animation: `pulse-audio ${1 + Math.random()}s infinite alternate ease-in-out`,
              }}
            />
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-[45%] bg-meet-bg flex flex-col justify-center items-center p-8 sm:p-12 border-meet-line">
        <div className="w-full max-w-[400px]">
          <div className="text-meet-purpleLight font-bold text-sm tracking-widest uppercase mb-8 lg:hidden">MeetNote AI</div>
          <h2 className="text-3xl font-bold text-meet-text mb-2">Welcome back</h2>
          <p className="text-meet-muted mb-8">Sign in to continue</p>

          <form className="space-y-5" onSubmit={handleSignIn}>
            <div>
              <label className="block text-sm font-semibold text-meet-muted uppercase tracking-widest mb-1.5">Email address</label>
              <input type="email" className={inputClass} placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-meet-muted uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-meet-muted hover:text-meet-text focus:outline-none"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="#" className="text-sm font-medium text-meet-purpleLight hover:text-meet-text transition">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-meet-purple text-meet-text rounded-lg font-bold text-lg hover:bg-meet-purpleHover transition shadow-meet-sm"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-grow border-t border-meet-line" />
            <span className="mx-4 text-sm text-meet-muted font-medium uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-meet-line" />
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center transition border border-meet-line bg-transparent text-meet-muted hover:text-meet-text hover:border-[rgba(109,95,213,0.3)]"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3 opacity-90" />
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center transition border border-meet-line bg-transparent text-meet-muted hover:text-meet-text hover:border-[rgba(109,95,213,0.3)]"
            >
              <img src="https://www.svgrepo.com/show/475661/microsoft-color.svg" alt="Microsoft" className="w-5 h-5 mr-3 opacity-90" />
              Continue with Microsoft
            </button>
          </div>

          <p className="mt-10 text-center text-meet-muted text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/dashboard" className="text-meet-purpleLight font-semibold hover:text-meet-text hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse-audio {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
