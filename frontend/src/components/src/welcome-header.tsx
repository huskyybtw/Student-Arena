import { Button } from "@/components/ui/button";
import { Link, Trophy } from "lucide-react";
import React from "react";

function WelcomeHeader() {
  return (
    <header className="border-b border-border bg-card/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              LoL Student Arena
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Zaloguj się</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Zarejestruj się</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default WelcomeHeader;
