import { useState } from "react";
import { Link } from "react-router-dom";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed');
      
      setIsSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">Reset Password</h2>
      
      {!isSubmitted ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="admin@telkomsel.com"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md shadow-red-600/20"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Check your email</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            We've sent a password reset link to <span className="font-medium text-gray-900 dark:text-gray-300">{email}</span>
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Remember your password? <Link to="/login" className="text-red-600 hover:text-red-700 dark:text-red-400 font-medium">Log in here</Link>
      </div>
    </div>
  );
}
