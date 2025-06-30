import { useEffect } from "react";
import { useLocation } from "wouter";

export default function TestLogin() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Simulate a successful login for testing
    fetch('/api/auth/test-login', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLocation('/');
        }
      });
  }, [setLocation]);
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-white">Setting up test login...</div>
    </div>
  );
}