import { Button } from '@/components/ui/button'
import { ArrowRight, Code, Server, Users, Shield, Github, FileText } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm animate-slide-in-top">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-blue-400">CloudVoxel</div>
            <div className="space-x-1 sm:space-x-4">
              <NavLink href="#about">About</NavLink>
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#roadmap">Roadmap</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <RoadmapSection />
        <ContactSection />
      </main>

      <footer className="bg-gray-800 text-gray-300 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 CloudVoxel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
    >
      {children}
    </a>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] animate-pulse-slow"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 animate-fade-in-up">CloudVoxel</h1>
        <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl animate-fade-in-up animation-delay-200">
          An Open-Source, self-hosted solution for private cloud file storage.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up animation-delay-400">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
            Start Self-Hosting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400/10 transition-colors duration-300">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-32 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div className="animate-fade-in-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">About CloudVoxel</h2>
            <p className="text-gray-300 mb-6">
              CloudVoxel is born from the belief that everyone should have the power to control their own data.
              Our mission is to provide a robust, open-source solution for self-hosted cloud storage that puts
              privacy and security first.
            </p>
            <p className="text-gray-300 mb-6">
              With CloudVoxel, you&apos;re not just using a cloud service - you&apos;re taking control of your digital footprint.
              Host it on your own hardware, customize it to your needs, and enjoy the peace of mind that comes with
              true data ownership.
            </p>
          </div>
          <div className="mt-10 lg:mt-0 flex justify-center animate-fade-in-right">
            <Image src="/placeholder.svg?height=400&width=400" alt="CloudVoxel Illustration" className="rounded-lg shadow-2xl" height={400} width={400} />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12 animate-fade-in-up">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Code className="h-12 w-12 text-blue-400" />}
            title="Open Source"
            description="Fully open-source, allowing for community contributions and audits."
            delay="0"
          />
          <FeatureCard
            icon={<Server className="h-12 w-12 text-green-400" />}
            title="Self-Hosted"
            description="Host your own private cloud with complete control over your data."
            delay="200"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-purple-400" />}
            title="Private Logins"
            description="Secure access with private login capabilities for your cloud."
            delay="400"
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
  return (
    <div className={`bg-gray-700 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105 animate-fade-in-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}

function RoadmapSection() {
  return (
    <section id="roadmap" className="py-20 sm:py-32 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12 animate-fade-in-up">Project Roadmap</h2>
        <div className="space-y-12">
          <RoadmapItem
            icon={<Shield className="h-8 w-8 text-green-400" />}
            title="Enhanced Security"
            description="Implementing end-to-end encryption for all stored files."
            status="In Progress"
            delay="0"
          />
          <RoadmapItem
            icon={<FileText className="h-8 w-8 text-yellow-400" />}
            title="File Sharing"
            description="Develop secure file sharing capabilities between users."
            status="Planned"
            delay="200"
          />
          <RoadmapItem
            icon={<Github className="h-8 w-8 text-blue-400" />}
            title="Open Beta"
            description="Launch open beta for community testing and feedback."
            status="Upcoming"
            delay="400"
          />
        </div>
      </div>
    </section>
  )
}

function RoadmapItem({ icon, title, description, status, delay }: { icon: React.ReactNode, title: string, description: string, status: string, delay: string }) {
  return (
    <div className={`flex items-start space-x-4 animate-fade-in-left`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-300 mt-1">{description}</p>
        <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">
          {status}
        </span>
      </div>
    </div>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="py-20 sm:py-32 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 animate-fade-in-up">Get Involved</h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          CloudVoxel is an open-source project, and we welcome contributions from the community.
          Whether you&apos;re a developer, designer, or just enthusiastic about the project, there are many ways to get involved.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up animation-delay-400">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
            Join Our Discord
          </Button>
          <Button size="lg" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400/10 transition-colors duration-300">
            Contribute on GitHub
          </Button>
        </div>
      </div>
    </section>
  )
}

