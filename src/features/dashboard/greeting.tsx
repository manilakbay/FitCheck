"use client";

import { useEffect, useState } from "react";

function greetingForHour(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Good night";
}

/**
 * Client-only so the greeting reflects the visitor's local hour rather
 * than the server's timezone. Renders "Welcome back" on the first
 * server pass to avoid a jarring hydration flash.
 */
export function Greeting({ name }: { name: string }) {
  const [phrase, setPhrase] = useState<string>("Welcome back");

  useEffect(() => {
    setPhrase(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <>
      {phrase}, {name}
    </>
  );
}
