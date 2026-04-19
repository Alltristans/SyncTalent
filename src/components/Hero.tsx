"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <span>Precision Matching & Skill Validation</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Bridge the <span className="text-gradient">Skill Gap</span> <br /> 
          with Real-Time Validation.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl text-lg text-white/60 mb-10"
        >
          The next generation recruitment ecosystem for the Logistics and Tech industry. 
          Stop guessing and start matching with AI-driven case study validation.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/candidate" className="px-8 py-4 bg-accent-blue text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95">
            Join as Candidate <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/employer" className="px-8 py-4 glass-card text-white rounded-xl font-semibold hover:bg-white/5 transition-all hover:scale-105 active:scale-95">
            Hire with Precision
          </Link>
        </motion.div>
      </div>
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[800px] h-[500px] bg-accent-blue/20 blur-[120px] rounded-full opacity-30" />
    </section>
  );
}
