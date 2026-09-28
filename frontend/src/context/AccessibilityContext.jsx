import { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [activeProfile, setActiveProfile] = useState(null); // null, 'colorblind', 'dyslexia', 'hearing', 'adhd'
  const [userName, setUserName] = useState("Rahul");
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.body.className = `bg-meet-bg text-meet-text antialiased min-h-screen ${highContrast ? "high-contrast" : ""} ${reduceMotion ? "reduce-motion" : ""} profile-${activeProfile || "default"}`.trim();
  }, [activeProfile, highContrast, reduceMotion, fontSize]);

  return (
    <AccessibilityContext.Provider
      value={{
        activeProfile,
        setActiveProfile,
        userName,
        setUserName,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        reduceMotion,
        setReduceMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
