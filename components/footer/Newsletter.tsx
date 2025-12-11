"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 简单的表单处理，不实际发送邮件
    if (email) {
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <p className="text-green-600 dark:text-green-400">
          Thank you for your interest!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Stay tuned for updates on our screen tools.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" variant="default">
          Subscribe
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Get updates about new screen tools and features.
      </p>
    </form>
  );
}
