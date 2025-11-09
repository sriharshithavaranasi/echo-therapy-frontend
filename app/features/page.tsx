"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Shield,
  Fingerprint,
  Activity,
  Bot,
  LineChart,
  Wifi,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: <Bot className="w-10 h-10 text-primary drop-shadow-md" />,
    title: "Empathetic AI Companions",
    description:
      "Always available, emotionally intelligent AI listeners that adapt to your tone and needs — offering care that feels truly human.",
  },
  {
    icon: <Shield className="w-10 h-10 text-primary drop-shadow-md" />,
    title: "Blockchain-Powered Privacy",
    description:
      "Your sessions are encrypted, verified, and never shared — secured through blockchain to ensure absolute trust and transparency.",
  },
  {
    icon: <Fingerprint className="w-10 h-10 text-primary drop-shadow-md" />,
    title: "Confidential by Design",
    description:
      "Built with zero-knowledge proofs and end-to-end encryption — your data remains yours, always and entirely.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-24"
      >
        <motion.h1
          className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ["0%", "100%"],
          }}
          transition={{
            duration: 3,
            ease: "linear",
            repeat: Infinity,
          }}
          style={{ backgroundSize: "200% auto" }}
        >
          Platform Features
        </motion.h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Explore the intersection of empathy and technology — where AI
          and security unite to create a sanctuary for mental wellness.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card className="relative overflow-hidden p-8 h-full bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center mt-20"
      >
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Ready to Begin Your Healing Journey?
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Join a growing community redefining emotional well-being through
          compassionate, private, and intelligent support.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Start Your Journey
          <Heart className="ml-2 w-5 h-5 animate-pulse" />
        </a>
      </motion.div>
    </div>
  );
}
