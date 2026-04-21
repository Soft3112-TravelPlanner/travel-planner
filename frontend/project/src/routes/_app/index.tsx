import { Button, Card, CardBody, Image } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IoArrowForward, IoCompassOutline, IoCalendarOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/home/yeko/.gemini/antigravity/brain/9c6c0bb9-2c90-461c-a6bf-5d3ac464db36/travel_hero_background_1776790448668.png"
            alt="Travel Background"
            className="w-full h-full object-cover brightness-[0.6]"
            removeWrapper
          />
        </div>
        
        <div className="relative z-10 max-w-4xl px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              Your Journey <span className="text-primary italic">Perfected</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/80 font-light max-w-2xl mx-auto">
              Plan, explore, and experience the world like never before. The ultimate tool for modern travelers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                as={Link} 
                to="/search" 
                color="primary" 
                size="lg" 
                className="font-bold text-lg px-10 h-14"
                endContent={<IoArrowForward />}
              >
                Start Exploring
              </Button>
              <Button 
                as={Link} 
                to="/trips" 
                variant="bordered" 
                size="lg" 
                className="font-bold text-lg px-10 h-14 border-white text-white hover:bg-white hover:text-black transition-all"
              >
                Plan a Trip
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TravelSync?</h2>
            <p className="text-default-500 max-w-2xl mx-auto italic">
              We provide everything you need to turn your dream vacation into a reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<IoCompassOutline size={32} className="text-primary" />}
              title="Smart Exploration"
              description="Discover hidden gems and popular landmarks tailored to your budget and interests."
            />
            <FeatureCard 
              icon={<IoCalendarOutline size={32} className="text-secondary" />}
              title="Seamless Planning"
              description="Build detailed itineraries with our intuitive drag-and-drop trip planner."
            />
            <FeatureCard 
              icon={<IoShieldCheckmarkOutline size={32} className="text-success" />}
              title="Trusted Insights"
              description="Real reviews and estimated budgets to keep your travels stress-free and transparent."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-primary/10 border-y border-primary/20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 italic">Ready to see the world?</h2>
          <p className="text-lg text-default-600 mb-10 max-w-xl mx-auto">
            Join thousands of travelers who are already using TravelSync to plan their next adventure.
          </p>
          <Button 
            as={Link} 
            to="/auth/register" 
            color="primary" 
            size="lg" 
            variant="shadow"
            className="font-bold px-12"
          >
            Join Now for Free
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="p-4 border-none bg-default-50 hover:bg-default-100 transition-colors cursor-default shadow-sm">
      <CardBody className="flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-background rounded-2xl shadow-inner mb-2">
          {icon}
        </div>
        <h3 className="text-xl font-bold italic">{title}</h3>
        <p className="text-default-500 leading-relaxed">
          {description}
        </p>
      </CardBody>
    </Card>
  );
}
