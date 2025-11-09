"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, Target, Sparkles } from "lucide-react";

const missions = [
  {
    icon: <Heart className="w-10 h-10 text-primary drop-shadow-md" />,
    title: "Our Mission",
    description:
      "We’re here to make mental health support simple, accessible, and caring — using ethical AI and secure technology to connect people with help anytime, anywhere.",
  },
  {
    icon: <Target className="w-10 h-10 text-primary drop-shadow-md" />,
    title: "Our Vision",
    description:
      "A future where everyone can find trusted emotional support that’s private, personal, and powered by safe, transparent AI.",
  },
  {
    icon: <Sparkles className="w-10 h-10 text-primary drop-shadow-md" />,
    title: "Our Values",
    description:
      "Empathy, privacy, innovation, and trust guide everything we do — ensuring care that feels genuine, respectful, and secure.",
  },
];

export default function AboutPage() {
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
          About Echo
        </motion.h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Echo blends advanced AI with the security of blockchain to create
          safe, personal, and meaningful mental health support for everyone.
        </p>
      </motion.div>

      {/* Mission Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        {missions.map((mission) => (
          <motion.div
            key={mission.title}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Card className="relative overflow-hidden p-8 text-center h-full bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
              <div className="mb-6 flex justify-center">{mission.icon}</div>
              <h3 className="text-2xl font-semibold mb-4">{mission.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {mission.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
