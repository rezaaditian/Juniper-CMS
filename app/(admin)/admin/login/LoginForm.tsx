"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");

    try {
      let token = "";
      if (captchaRequired) {
        token = (window as any).grecaptcha.getResponse();
        if (!token) {
          setError("Please complete the captcha");
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
          token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        window.location.href = "/admin";
      } else {
        if (response.status === 429 && data.error === "Captcha required") {
          setCaptchaRequired(true);
          setError("Please complete the captcha to continue");
        } else {
          if ((window as any).grecaptcha) {
            (window as any).grecaptcha.reset();
          }
          setError(data.error || "Login failed");
        }
      }
    } catch (error) {
      if ((window as any).grecaptcha) {
        (window as any).grecaptcha.reset();
      }

      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-4">
        <div>
          <input
            id="username"
            name="username"
            type="text"
            required
            className="w-full px-4 py-3 text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
            placeholder="Username"
          />
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full px-4 py-3 pr-16 text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300"
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute text-sm text-blue-500 transform -translate-y-1/2 right-4 top-1/2 hover:text-blue-600 focus:outline-none"
          >
            {showPassword ? "hide" : "show"}
          </button>
        </div>

        {/* Munculkan captcha kalau dibutuhkan */}
        {captchaRequired && (
          <div className="flex justify-center">
            <div
              className="g-recaptcha"
              data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            ></div>
            <script
              src="https://www.google.com/recaptcha/api.js"
              async
              defer
            ></script>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 text-sm text-center text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 font-medium text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="w-4 h-4 mr-3 -ml-1 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing in...
            </span>
          ) : (
            "Log in"
          )}
        </button>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-600">
            <input type="checkbox" className="mr-2 border-gray-300 rounded" />
            Remember me
          </label>
          <button
            type="button"
            className="flex items-center text-blue-500 hover:text-blue-600"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-5.5-1.5-5.5-4a3.5 3.5 0 117 0c0 2.5-2.5 4-5.5 4a6 6 0 01-6-6 2 2 0 012-2m0 0V3"
              />
            </svg>
            Forgot password
          </button>
        </div>
      </form>
    </div>
  );
}
