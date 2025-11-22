import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart2, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">

      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-background text-foreground">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Trade Smarter, <br /> Win Bigger
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            The most advanced platform for real-time trading and betting. Experience lightning-fast execution and secure transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
            <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
              <Link href="/auth/signup">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-full">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
        

        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        </div>
      </section>


      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground text-lg">Built for professionals, accessible to everyone.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                <BarChart2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Get instant insights with our advanced charting tools and real-time market data feeds.
              </p>
            </div>

            <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Transactions</h3>
              <p className="text-muted-foreground">
                Your funds are protected by industry-leading security protocols and encryption.
              </p>
            </div>

            <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Payouts</h3>
              <p className="text-muted-foreground">
                Withdraw your winnings instantly. No waiting periods, no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-24 px-4 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start your journey?</h2>
          <p className="text-primary-foreground/80 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of traders who are already winning big on our platform.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-10 py-7 rounded-full shadow-2xl hover:scale-105 transition-transform">
            <Link href="/auth/signup">Sign Up Now</Link>
          </Button>
        </div>
        

        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
}
