import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Target, Award } from "lucide-react"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">LoL Student Arena</h1>
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

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            Platforma <span className="text-primary">League of Legends</span> dla Studentów
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Dołącz do największej społeczności studenckich graczy LoL. Twórz drużyny, rywalizuj w turniejach i wspinaj
            się w rankingach.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Formuj Drużyny</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Twórz zespoły z innymi studentami, zarządzaj składem i rywalizuj jako zorganizowana drużyna.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Mecze Rankingowe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Umawiaj spotkania towarzyskie i rankingowe. Wspinaj się w tabeli i zdobywaj uznanie.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Turnieje</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Uczestnicz w turniejach studenckich z pulami nagród i prestiżowymi tytułami.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Award className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Rankingi</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Śledź swoje postępy i porównuj się z najlepszymi graczami i drużynami.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
