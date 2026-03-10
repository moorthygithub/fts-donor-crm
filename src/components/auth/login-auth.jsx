import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const LoginAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const emailInputRef = useRef(null);
  const navigate = useNavigate();

  const loadingMessages = [
    "Setting things up for you...",
    "Checking your credentials...",
    "Preparing your dashboard...",
    "Almost there...",
  ];

  useEffect(() => {
    let messageIndex = 0;
    let intervalId;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  // Auto-focus on email input
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !isLoading) {
      handleLogin(event);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both username and password.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/loginWithDonorId`,
        formData,
      );

      if (res.data.code === 200) {
        if (!res.data.UserInfo || !res.data.UserInfo.token) {
          toast.error("Login Failed: No token received.");
          setIsLoading(false);
          return;
        }

        const { UserInfo, version, year } = res.data;
        const isProduction = window.location.protocol === "https:";

        const cookieOptions = {
          expires: 7,
          secure: isProduction,
          sameSite: "Strict",
          path: "/",
        };

        // Set all cookies
        Cookies.set("token", UserInfo.token, cookieOptions);
        Cookies.set("id", UserInfo.user.id, cookieOptions);
        Cookies.set("name", UserInfo.user.indicomp_full_name, cookieOptions);
        Cookies.set("chapter_id", UserInfo.user.chapter_id, cookieOptions);
        Cookies.set("user_name", UserInfo.user.indicomp_fts_id, cookieOptions);
        Cookies.set("email", UserInfo.user.indicomp_email, cookieOptions);
        Cookies.set(
          "token-expire-time",
          UserInfo?.token_expires_at,
          cookieOptions,
        );
        Cookies.set("ver_con", version?.version_panel, cookieOptions);
        Cookies.set("currentYear", year?.current_year, cookieOptions);

        const token = Cookies.get("token");
        const tokenExpireTime = Cookies.get("token-expire-time");
        if (!token && !tokenExpireTime) {
          throw new Error("Cookies not set properly");
        }

        navigate("/home", { replace: true });
      } else {
        toast.error(res.data.message || "Login Failed: Unexpected response.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(
        "❌ Login Error:",
        error.response?.data?.message || error.message,
      );
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="min-h-screen flex">
        {/* Left Section - Form */}
        <div className="w-full lg:w-1/2 bg-gray-200 flex items-center justify-center px-8 py-12">
          <div className="max-w-md w-full">
            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight mb-6 canela-font">
              Together let's achieve something incredible
            </h1>

            {/* Description */}
            <p className="text-gray-700 text-base mb-4 leading-relaxed">
              This secure area provides Ekal supporters with information on
              school allocation against their donations, and online transactions
              made on the ekal.org website.
            </p>

            <p className="text-gray-700 text-base mb-8">
              If you are an active Ekal donor, but do not have access to MyEkal
              as yet, please{" "}
              <Link
                to="/forgot-password"
                className="text-orange-500 underline hover:text-orange-600"
              >
                click here
              </Link>{" "}
              to set your password.
            </p>

            <div className="border-t border-gray-300 my-8"></div>

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-blue-900 font-semibold mb-2 text-base"
                >
                  Donor ID
                </label>
                <input
                  ref={emailInputRef}
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Donor ID"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded bg-white text-gray-700 placeholder-gray-400 focus:outline-none  focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-blue-900 font-semibold mb-2 text-base"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="*******"
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition duration-200 uppercase text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">{loadingMessage}</span>
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-gray-600 hover:text-gray-800 underline text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Section - Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="https://www.ekal.org/assets/images/login-img2.jpg"
            alt="Children learning"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </>
  );
};

export default LoginAuth;
