import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { CheckCircle2, Zap, BarChart3, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-mesh">
      <Navbar />
      <Hero />
      
      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Engineered for Precision</h2>
            <p className="text-white/60">Advanced AI features to eliminate mismatch and validate expertise.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="Hard-Lock Matching"
              description="Our system prevents applications if core skill requirements are not met, saving time for everyone."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
              title="Case Validation"
              description="Pre-application tests with real-world scenarios to validate practical skills immediately."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-accent-blue" />}
              title="Skill Gap Analysis"
              description="Identifying exactly where candidates lack and providing personalized learning recommendations."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-accent-purple" />}
              title="SafePlace Verification"
              description="Ensuring workplace credibility and security for every job posting."
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-white/10 px-6 text-center text-white/40 text-sm">
        <p>© 2026 SyncTalent AI. Built for Microsoft Elevate Hackathon.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-8 hover:bg-white/5 transition-all group">
      <div className="mb-4 bg-white/5 w-12 h-12 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-white/50 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
