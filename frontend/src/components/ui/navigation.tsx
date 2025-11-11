import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Trophy, LogOut } from "lucide-react";
import Link from "next/link";
import { useCurrentUser, useLogout } from "@/lib/providers/auth-provider";

export function Navigation() {
  const { user } = useCurrentUser();
  const logout = useLogout();

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
                <Link href="/matches">Graj</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/teams">Drużyny</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/posting">Tablica</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/ratings">Rankingi</Link>
              </Button>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1 hover:bg-muted/50 transition-colors">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">
                      {user?.playerAccount.gameName ?? "Unknown"}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        RATING
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {user?.playerAccount.rating ?? 1000}
                      </span>
                    </div>
                  </div>
                  <Avatar>
                    <AvatarImage src="/generic-fantasy-champion.png" />
                    <AvatarFallback>PG</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.playerAccount.gameName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
