
import Link from 'next/link';
import { Logo } from './logo';
import { Twitter, Linkedin, Facebook, Mail, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo className="text-primary-foreground"/>
            <p className="text-sm text-primary-foreground/70">
              ED Meds from $2.99 · Doctor in 5 Min · Gold Unlimited $99/yr · Now in ALL Nigeria
            </p>
            <div className="flex flex-col gap-2 text-sm">
                <a href="https://wa.me/14083049969" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground">
                  <MessageCircle size={16}/> <span>+1 (408) 304-9969</span>
                </a>
                 <a href="mailto:approversweb@gmail.com" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground">
                  <Mail size={16}/> <span>approversweb@gmail.com</span>
                </a>
            </div>
            <div className="flex gap-4 mt-2">
              <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground"><Twitter size={20}/></Link>
              <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground"><Linkedin size={20}/></Link>
              <Link href="#" className="text-primary-foreground/70 hover:text-primary-foreground"><Facebook size={20}/></Link>
            </div>
          </div>
          <div>
            <h4 className="font-headline text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">About Us</Link></li>
              <li><Link href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Careers</Link></li>
              <li><Link href="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-lg mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link href="#specialties" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Erectile Dysfunction</Link></li>
              <li><Link href="#specialties" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Hair Loss</Link></li>
              <li><Link href="#specialties" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Mental Health</Link></li>
              <li><Link href="#specialties" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Urgent Care</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground">HIPAA Notice</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/70">
          <p>&copy; {new Date().getFullYear()} ZumaiDoc. All rights reserved.</p>
          <p className="mt-2 text-xs">This service is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for any medical concerns.</p>
        </div>
      </div>
    </footer>
  );
}
