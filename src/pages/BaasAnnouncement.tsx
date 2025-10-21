import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Clock, Users, TrendingUp, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BaasAnnouncement() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header with Badge */}
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 text-base bg-amber-500 hover:bg-amber-600">
            📢 Official Announcement
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
            BaaS Partner Onboarding Closing on October 31st
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Effective Date: October 31st, 2025</span>
          </div>
        </div>

        {/* Critical Alert */}
        <Alert className="mb-8 border-amber-500 bg-amber-950/20 text-white">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-base">
            <strong>Important Notice:</strong> October 31st will be the final day we accept any new BaaS partner registrations or onboardings under the current partnership structure. No new entries will be processed beyond this date.
          </AlertDescription>
        </Alert>

        {/* Main Announcement Card */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Dear Partners,
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                After careful review and strategic discussions, the company has decided to pause the onboarding of new BaaS (Business-as-a-Service) partners effective from <strong className="text-foreground">October 31st, 2025</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This means October 31st will be the final day we accept any new BaaS partner registrations or onboardings under the current partnership structure. No new entries will be processed beyond this date.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why This Decision Section */}
        <Card className="mb-8 shadow-lg border-primary/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Why This Decision:
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Over the past months, our focus has been divided between scaling operations and managing a large number of partner entries. While this has given us valuable insights, it has also shown that quality growth requires dedicated focus and deeper involvement with our existing partners.
              </p>
              <p>
                To ensure that every active partner gets the maximum possible support, visibility, and profit, we are choosing to <strong className="text-foreground">limit new entries</strong> and dedicate our energy towards <strong className="text-foreground">scaling existing success stories</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Section */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              What's Next:
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The BaaS onboarding program will be paused for a <strong className="text-foreground">minimum of one year</strong>, after which we'll review and decide whether to reopen applications.
            </p>
          </CardContent>
        </Card>

        {/* For Those in Pipeline */}
        <Card className="mb-8 shadow-lg border-red-900 bg-red-950/20">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
              <MessageCircle className="h-6 w-6" />
              For Those in the Pipeline:
            </h2>
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                If you are currently in discussion, under verification, or preparing to onboard, please <strong className="text-foreground">connect with your representative immediately</strong>.
              </p>
              <ul className="space-y-2 ml-4 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span>All deals, confirmations, and payments must be completed and verified before October 31st.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                  <span><strong className="text-foreground">No exceptions</strong> will be made post-deadline.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Closing Message */}
        <Card className="mb-8 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                We deeply value every individual who has shown interest in our BaaS journey so far. This decision is not a closure, but a <strong className="text-foreground">strategic shift towards precision, focus, and stronger long-term growth</strong>.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Thank you for your understanding, your energy, and the trust you've shown in our ecosystem.
              </p>
              <p className="text-xl font-semibold text-primary">
                Let's continue building what truly matters — businesses that last.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Signature */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Warm regards,</p>
          <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Team BoostMySites
          </p>
          <p className="text-muted-foreground">(Business-as-a-Service Division)</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-base">
            <Link to="/auth">Contact Your Representative</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

