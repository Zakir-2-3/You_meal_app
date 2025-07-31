"use client";

import { signIn } from "next-auth/react";

import "./GoogleLoginButton.scss";

const GoogleLoginButton = () => {
  const handleClick = () => {
    signIn("google", {
      prompt: "select_account",
      callbackUrl: "/",
    });
  };

  return (
    <button className="login-btn-google" type="button" onClick={handleClick}>
      <svg
        className="google-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 533.5 544.3"
        width="20"
        height="20"
      >
        <path
          fill="#4285f4"
          d="M533.5 278.4c0-17.5-1.6-35-4.7-51.9H272v98.3h147.4c-6.4 34.3-25 63.2-53.4 82.6v68.4h86.2c50.5-46.5 81.3-115 81.3-197.4z"
        />
        <path
          fill="#34a853"
          d="M272 544.3c72.6 0 133.7-24 178.3-65.4l-86.2-68.4c-24 16.1-54.8 25.4-92.1 25.4-70.9 0-131-47.9-152.5-112.3h-90.2v70.6c44.5 87.5 136 149.1 242.7 149.1z"
        />
        <path
          fill="#fbbc04"
          d="M119.5 323.6c-10.2-30.1-10.2-62.6 0-92.7v-70.6h-90.2c-32.7 64.7-32.7 140.2 0 204.9l90.2-70.6z"
        />
        <path
          fill="#ea4335"
          d="M272 107.7c39.5 0 75 13.6 102.8 40.3l77.1-77.1C405.7 24.6 344.6 0 272 0 165.3 0 73.8 61.6 29.3 149.1l90.2 70.6C141 155.5 201.1 107.7 272 107.7z"
        />
      </svg>
      <span className="login-btn-google__text">Войти через Google</span>
    </button>
  );
};

export default GoogleLoginButton;
