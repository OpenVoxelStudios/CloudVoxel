import { Button } from '@/components/ui/button'
import { ArrowRight, Code, Server, Users, Shield, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import clientconfig from '../../clientconfig'
import { redirect, RedirectType } from 'next/navigation'
import RootLayout, { metadata as defaultMetadata } from './dashboard/layout'

export const metadata = defaultMetadata;

export default function Home() {
  if (!clientconfig.mainPageAllowed) return redirect('/dashboard', RedirectType.replace);

  return (
    <RootLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm animate-slide-in-top">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="text-2xl font-bold text-blue-400">CloudVoxel</div>
              <div className="hidden sm:flex space-x-1 sm:space-x-4">
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
            <p>&copy; 2024 OpenVoxel Studios. MIT Licensed.</p>
          </div>
        </footer>
      </div>
    </RootLayout>
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
          <Link href='/dashboard'>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
              Open Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href='https://github.com/OpenVoxelStudios/CloudVoxel/' target='_blank'>
            <Button size="lg" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400/10 transition-colors duration-300">
              Start Self-Hosting
            </Button>
          </Link>
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
              CloudVoxel is more than just an online file hosting service. It is an <Link href={'https://github.com/OpenVoxelStudios/CloudVoxel'} target='_blank' className='underline'>Open-Source</Link> local-first solution to file sharing.
              Our goal is to provide the code and tools necessary for anyone to host their own cloud storage service for their needs.
            </p>
            <p className="text-gray-300 mb-6">
              This is the default landing page when you just downloaded the project. Good news, it works!
              You can edit the <code>src/app/page.tsx</code> file to customize this page to your liking or disable it in <code>clientconfig.ts</code>.
            </p>
          </div>
          <div className="mt-10 lg:mt-0 flex justify-center animate-fade-in-right">
            <Image unoptimized src={clientconfig.websiteLogo} alt="CloudVoxel Illustration" className="rounded-lg shadow-2xl" height={400} width={400} />
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
            description="Secure access with private login capabilities for your cloud defining who can access your cloud."
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
        <Link href='https://github.com/orgs/OpenVoxelStudios/projects/4/views/1' target='_blank'>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-12 animate-fade-in-up underline">Project Roadmap</h2>
        </Link>
        <div className="space-y-12">
          <RoadmapItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>}
            title="Open Beta"
            description="Launch open beta for community testing and feedback."
            status="Live!"
            delay="0"
          />
          <RoadmapItem
            icon={<User className="h-8 w-8 text-yellow-400" />}
            title="Advanced Login"
            description="More login options and more control over who can access what folders."
            status="Done!"
            delay="200"
          />
          <RoadmapItem
            icon={<Shield className="h-8 w-8 text-green-400" />}
            title="Advanced Sharing"
            description="Create share links with a use or time limit."
            status="Planned"
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
          CloudVoxel is developped and maintained by <Link href='mailto:kubik@openvoxel.studio' className='underline'>Kubik</Link>. Contributions are welcome!
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up animation-delay-400">
          <Link href="https://discord.gg/Xhvb2wujVh" target="_blank">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300">
              Join Our Discord
            </Button>
          </Link>
          <Link href="https://github.com/OpenVoxelStudios/CloudVoxel" target="_blank">
            <Button size="lg" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400/10 transition-colors duration-300">
              Contribute on GitHub
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
