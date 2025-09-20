import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Trophy } from "lucide-react";
import Link from "next/link";

export function NavBar() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="p-2 bg-primary rounded-lg">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  LoL Student Arena
                </h1>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/play">Graj</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/teams">Drużyny</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/bulletin">Tablica</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/rankings">Rankingi</Link>
              </Button>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* <NotificationsDropdown /> */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  ProGamer2024
                </p>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    Gold II
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    1,247 LP
                  </span>
                </div>
              </div>
              <Avatar>
                <AvatarImage src="/generic-fantasy-champion.png" />
                <AvatarFallback>PG</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
