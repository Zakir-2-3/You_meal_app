"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import LoadingSpinner from "@/UI/loaders/LoadingSpinner";

export default function GlobalSpinner() {
  const isVisible = useSelector(
    (state: RootState) => state.user.isGoogleSignIn,
  );

  if (!isVisible) return null;

  return (
    <>
      <div className="overlay-loading" />
      <div className="overlay-spinner">
        <LoadingSpinner />
      </div>
    </>
  );
}
