'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Lock,
  FileText,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="flex h-16 items-center justify-between px-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            {/* <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">HC</span>
            </div> */}
            <span className="font-semibold">Secure Medical Data</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Secure. Verifiable. Blockchain-backed.
            </span>
          </div> */}

          <h1 className="text-5xl font-bold tracking-tight text-balance">
            Blockchain based Secure Medical Data
            <br />
            {/* <span className="text-primary">Platform</span> */}
          </h1>

          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            empowers patients, doctors, and researchers to securely share medical
            records with blockchain verification and complete audit trails.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Sign Up
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Features</h2>
            <p className="text-muted-foreground">
              Enterprise-grade security combined with blockchain transparency
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>End-to-End Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your medical records are encrypted in transit and at rest. Only you and
                  authorized recipients can access your data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Blockchain Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Every record is anchored on the blockchain, creating an immutable audit trail
                  that proves authenticity and detects tampering.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Complete Control</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Grant and revoke access to your records at any time. See who accessed what and
                  when.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Multi-Role Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Designed for patients, doctors, and researchers. Each role has appropriate
                  access and capabilities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>HIPAA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built with healthcare regulations in mind. Full compliance with HIPAA, GDPR,
                  and other standards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Research Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Researchers can access anonymized datasets with verified consent, accelerating
                  medical breakthroughs.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Built for Everyone</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">For Patients</h3>
              <p className="text-muted-foreground">
                Securely store and manage your medical records. Share them with doctors when
                needed and revoke access anytime.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Secure upload and storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Fine-grained access control
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Complete audit trail
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">For Doctors</h3>
              <p className="text-muted-foreground">
                Access your patients' records with their consent. Verify authenticity through
                blockchain verification.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Patient record access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Verify authenticity
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  Secure collaboration
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">For Researchers</h3>
              <p className="text-muted-foreground">
                Access anonymized datasets with verified patient consent for groundbreaking
                medical research.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Anonymized datasets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Verified authenticity
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Compliance assured
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
