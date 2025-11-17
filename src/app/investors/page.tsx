import Image from 'next/image';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type SlideProps = {
  slideNumber: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  imageHint: string;
  children: React.ReactNode;
};

const Slide = ({ slideNumber, title, subtitle, imageUrl, imageHint, children }: SlideProps) => (
  <Card className="overflow-hidden shadow-lg transform transition-transform hover:scale-[1.02]">
    <div className="grid md:grid-cols-2 min-h-[30rem]">
      <div className="p-8 md:p-12 flex flex-col justify-center">
        <div className="mb-4">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Slide {slideNumber}</span>
          <h2 className="text-3xl lg:text-4xl font-headline mt-1">{title}</h2>
          {subtitle && <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="text-base text-foreground/90 space-y-4 prose prose-neutral dark:prose-invert">
          {children}
        </div>
      </div>
      <div className="relative min-h-[20rem] md:min-h-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          data-ai-hint={imageHint}
        />
      </div>
    </div>
  </Card>
);

export default function InvestorsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Header />
      <main className="flex-grow py-12 md:py-20">
        <div className="container mx-auto px-4 space-y-12">

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              Reinventing Telehealth Access
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Virtual care that works for everyone. Built for speed, simplicity, and scale.
            </p>
             <p className="mt-2 text-sm text-muted-foreground">Founder: Jonah Baka | 2025</p>
          </div>

          <Slide slideNumber={2} title="Healthcare is Broken—For Patients and Providers" imageUrl="https://picsum.photos/seed/slide2/800/600" imageHint="frustrated patient">
            <div>
              <h3 className="font-semibold">Patients Face:</h3>
              <ul className="list-disc pl-5">
                <li>Slow access to appointments</li>
                <li>Difficulty finding specialists</li>
                <li>High costs & long waits</li>
                <li>Limited access in underserved areas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Providers Face:</h3>
              <ul className="list-disc pl-5">
                <li>No simple, unified platform</li>
                <li>Fragmented tools (EHR, billing, video)</li>
                <li>High administrative burden</li>
                <li>Difficulty attracting new patients</li>
              </ul>
            </div>
            <p className="font-bold">Existing systems are slow, clunky, and expensive—inefficiency hurts everyone.</p>
          </Slide>
          
          <Slide slideNumber={3} title="Unlocking a $455B Telehealth Market" subtitle="The Opportunity by 2030" imageUrl="https://picsum.photos/seed/slide3/800/600" imageHint="financial graph growth">
             <p>We are creating a unified, modern infrastructure that:</p>
             <ul className="list-disc pl-5">
                <li>Onboards licensed providers in minutes</li>
                <li>Lets patients find providers instantly</li>
                <li>Manages visits, messaging, documentation, & prescriptions</li>
                <li>Creates a real-time marketplace—“Uber for healthcare”</li>
            </ul>
            <p className="font-bold">The market is massive but under-optimized. It's time to disrupt.</p>
          </Slide>

          <Slide slideNumber={4} title="Our Solution: A Seamless Platform" subtitle="Think: Stripe + Zoom + Clinic + Marketplace" imageUrl="https://picsum.photos/seed/slide4/800/600" imageHint="dashboard interface collage">
            <h3 className="font-semibold">Key Features:</h3>
            <ul className="list-disc pl-5 columns-2">
                <li>Instant Provider Onboarding</li>
                <li>Virtual Waiting Rooms</li>
                <li>Secure Messaging</li>
                <li>Google/Email Login</li>
                <li>Provider Dashboard</li>
                <li>Visit Notes & Docs</li>
                <li>WebRTC Video</li>
                <li>Scheduling & Queue</li>
                <li>Payments & Payouts</li>
                <li>AI for Triage & Follow-ups</li>
            </ul>
          </Slide>

          <Slide slideNumber={5} title="Why Now? The Perfect Timing" subtitle="The shift from closed systems to open platforms is here." imageUrl="https://picsum.photos/seed/slide5/800/600" imageHint="abstract technology network">
            <ul className="list-disc pl-5">
              <li>Virtual care demand is baseline, not optional</li>
              <li>Providers are leaving legacy hospital systems</li>
              <li>Regulators & insurers fully embrace telemedicine</li>
              <li>AI unlocks smarter triage & automation</li>
              <li>Legacy platforms are outdated and overpriced</li>
            </ul>
          </Slide>
          
          <Slide slideNumber={6} title="Three Strong Revenue Streams" subtitle="A hybrid SaaS + marketplace model." imageUrl="https://picsum.photos/seed/slide6/800/600" imageHint="money streams flow">
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <span className="font-bold">Provider Subscription (Primary):</span>
                <br />$49–$149/month for a full suite of tools.
              </li>
              <li>
                <span className="font-bold">Per-Visit Fee:</span>
                <br />10–20% on $20–$80 visits.
              </li>
              <li>
                <span className="font-bold">Enterprise Contracts (Phase 2):</span>
                <br />Branded portals for clinics & networks.
              </li>
            </ol>
          </Slide>

          <Slide slideNumber={7} title="Our Path to Profitability" subtitle="Low CAC, high retention, and scalable growth." imageUrl="https://picsum.photos/seed/slide7/800/600" imageHint="roadmap growth chart">
            <ol className="list-decimal pl-5 space-y-3">
              <li><span className="font-bold">Provider Growth:</span> Instant sign-ups & providers bring their own patients → near-zero CAC.</li>
              <li><span className="font-bold">Marketplace Expansion:</span> Patients discover providers, increasing visit volume.</li>
              <li><span className="font-bold">AI Automation:</span> Reduce operational costs and admin burden.</li>
              <li><span className="font-bold">Insurance Integration:</span> Unlock reimbursement and recurring revenue.</li>
            </ol>
          </Slide>

          <Slide slideNumber={8} title="Our Competitive Advantage" subtitle="The agile disruptor in a stagnant space." imageUrl="https://picsum.photos/seed/slide8/800/600" imageHint="rocket launch speed">
            <ul className="list-disc pl-5">
                <li>Instant provider verification & onboarding</li>
                <li>Marketplace + clinical tools unified in one platform</li>
                <li>Fast, modern consumer-grade UX</li>
                <li>AI automation for documentation & triage</li>
                <li>Built-in HIPAA & SOC2 compliance</li>
                <li>Architecture optimized for global scalability</li>
            </ul>
          </Slide>

          <Slide slideNumber={9} title="Traction & Milestones" subtitle="Early wins show momentum is accelerating." imageUrl="https://picsum.photos/seed/slide9/800/600" imageHint="celebrating success team">
             <ul className="list-disc pl-5">
                <li>100–200 providers onboarded in first 3 months</li>
                <li>1,000+ patient visits</li>
                <li>$20–$40 average revenue per visit</li>
                <li>80% of virtual care admin tasks automated</li>
                <li>Strong word-of-mouth growth in clinician communities</li>
            </ul>
          </Slide>

          <Slide slideNumber={10} title="Go-To-Market Strategy" subtitle="A balanced organic + paid strategy for scale." imageUrl="https://picsum.photos/seed/slide10/800/600" imageHint="marketing strategy diagram">
            <div>
              <h3 className="font-semibold">Providers:</h3>
              <p>Creators on TikTok/Instagram, partnerships, free profiles.</p>
            </div>
            <div>
              <h3 className="font-semibold">Patients:</h3>
              <p>PPC ads on symptoms, pharmacy tie-ins, provider-shared links.</p>
            </div>
            <div>
              <h3 className="font-semibold">Enterprise:</h3>
              <p>Clinics, behavioral health groups, startups needing telehealth infrastructure.</p>
            </div>
          </Slide>

          <Slide slideNumber={11} title="The Vision: An OS for Virtual Healthcare" subtitle="Handling the full lifecycle of modern care." imageUrl="https://picsum.photos/seed/slide11/800/600" imageHint="digital ecosystem futuristic">
            <ul className="list-disc pl-5">
                <li><span className="font-bold">Phase 1:</span> Empower independent practitioners</li>
                <li><span className="font-bold">Phase 2:</span> Expand to small/medium clinics</li>
                <li><span className="font-bold">Phase 3:</span> Become national/global infrastructure</li>
            </ul>
          </Slide>

          <Slide slideNumber={12} title="3-Year Financial Projections" subtitle="Scaling to 30-45% profit margins." imageUrl="https://picsum.photos/seed/slide12/800/600" imageHint="financial forecast chart">
            <ul className="list-disc pl-5">
                <li><span className="font-bold">Year 1:</span> $500K revenue • 2,000 providers • 50K visits</li>
                <li><span className="font-bold">Year 2:</span> $3–5M revenue • 10,000 providers • 300K visits</li>
                <li><span className="font-bold">Year 3:</span> $10M+ revenue • 25,000 providers • 1M+ visits</li>
            </ul>
          </Slide>

          <Slide slideNumber={13} title="An Experienced Team" subtitle="Lean, AI-focused, and ready to execute at speed." imageUrl="https://picsum.photos/seed/slide13/800/600" imageHint="team portrait professional">
             <ul className="list-disc pl-5">
                <li><span className="font-bold">Founder (Jonah Baka):</span> Product visionary with operations + tech experience.</li>
                <li><span className="font-bold">Advisors:</span> Healthcare, compliance, and telemedicine experts.</li>
                <li><span className="font-bold">Engineering Team:</span> Built for rapid iteration.</li>
            </ul>
          </Slide>

           <Slide slideNumber={14} title="The Investment Ask: $500K – $2M" subtitle="12-18 month runway to key milestones." imageUrl="https://picsum.photos/seed/slide14/800/600" imageHint="investment money growth">
             <h3 className="font-semibold">Funds Will Be Used For:</h3>
             <ul className="list-disc pl-5">
                <li>Engineering & product development</li>
                <li>Compliance audits</li>
                <li>Provider acquisition</li>
                <li>AI triage & automation</li>
                <li>Marketplace growth</li>
            </ul>
          </Slide>

          <Card className="text-center p-8 md:p-12 bg-card">
              <h2 className="text-4xl md:text-5xl font-headline">Reshaping Healthcare’s Future</h2>
              <p className="mt-2 text-lg text-muted-foreground">Fast. Accessible. Global.</p>
              <p className="mt-6 font-semibold">Join us in building the operating system of modern telemedicine.</p>
              <Link href="mailto:evolvedu@outlook.com">
                <Button size="lg" className="mt-6">
                  Contact Us to Invest
                  <ArrowRight className="ml-2"/>
                </Button>
              </Link>
          </Card>
          
        </div>
      </main>
      <Footer />
    </div>
  );
}
