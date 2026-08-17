"use client";

import { useEffect } from "react";

import HomeClient from "@/app/HomeClient";

export default function HomeClientWrapper() {
  useEffect(() => {
    const spinner = document.getElementById("global-spinner");
    if (spinner) spinner.style.display = "none";
  }, []);

  return <HomeClient />;
}
