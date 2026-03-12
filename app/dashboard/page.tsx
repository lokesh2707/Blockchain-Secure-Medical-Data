'use client';

import { useAuth } from '@/lib/auth-context';
import { fetchAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OverviewSkeleton } from '@/components/skeleton-loader';
import Link from 'next/link';
import { Upload, Share2, Lock, ScanLine as ChainLink, FileText, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading) {
      setIsLoaded(true);
    }
  }, [loading, user, router]);

  if (!isLoaded) {
    return (
      <div className="p-6 md:p-8">
        <OverviewSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your medical records securely with blockchain verification
        </p>
      </div>

      {/* Role-specific content */}
      {user?.role === 'patient' && <PatientDashboard />}
      {user?.role === 'doctor' && <DoctorDashboard />}
      {user?.role === 'researcher' && <ResearcherDashboard />}
      {user?.role === 'admin' && <AdminDashboard />}
    </div>
  );
}

function PatientDashboard() {
  const [stats, setStats] = useState({ totalRecords: 0, sharedCount: 0, verifiedCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    fetchAPI('/dashboard/stats').then(setStats).catch(console.error);

    // Fetch real activity data
    fetchAPI('/dashboard/activity')
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoadingActivities(false));
  }, []);

  return (
    <>
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">Medical documents uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Access</CardTitle>
            <Share2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sharedCount}</div>
            <p className="text-xs text-muted-foreground">Active sharing agreements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Records</CardTitle>
            <ChainLink className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedCount}</div>
            <p className="text-xs text-muted-foreground">Blockchain anchored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Lock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Just now</div>
            <p className="text-xs text-muted-foreground">System active</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/upload">
          <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add new medical documents to your records
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/records">
          <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                My Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage all your medical records
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/blockchain">
          <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ChainLink className="h-5 w-5 text-accent" />
                Blockchain Proof
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View audit trail and verification status
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/records">
          <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Grant Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Give doctor access to your medical records
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest medical record interactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingActivities ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading activities...</p>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${activity.type === 'shared'
                      ? 'bg-accent/20 text-accent'
                      : activity.type === 'upload'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary/20 text-secondary'
                      }`}
                  >
                    {activity.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function DoctorDashboard() {
  const [stats, setStats] = useState({ accessibleRecords: 0, activeConsents: 0, patients: 0 });

  useEffect(() => {
    fetchAPI('/dashboard/doctor-stats')
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessible Records</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accessibleRecords}</div>
            <p className="text-xs text-muted-foreground">Shared patient records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
            <Lock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConsents}</div>
            <p className="text-xs text-muted-foreground">Patients with consent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <Users className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patients}</div>
            <p className="text-xs text-muted-foreground">Under your care</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link href="/records">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                View Patient Records
              </Button>
            </Link>
            <Link href="/blockchain">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <ChainLink className="mr-2 h-4 w-4" />
                Verify Record Authenticity
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function ResearcherDashboard() {
  const [stats, setStats] = useState({ datasets: 0, verifiedRecords: 0, anchors: 0 });

  useEffect(() => {
    fetchAPI('/dashboard/researcher-stats')
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datasets</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.datasets}</div>
            <p className="text-xs text-muted-foreground">Anonymized datasets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Records</CardTitle>
            <ChainLink className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedRecords}</div>
            <p className="text-xs text-muted-foreground">Records available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anchors</CardTitle>
            <Lock className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.anchors}</div>
            <p className="text-xs text-muted-foreground">Blockchain verified</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link href="/research">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Browse Research Data
              </Button>
            </Link>
            <Link href="/blockchain">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <ChainLink className="mr-2 h-4 w-4" />
                View Blockchain Ledger
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, researchers: 0 });

  useEffect(() => {
    fetchAPI('/dashboard/admin-stats')
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Patients</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.patients}</div>
          <p className="text-xs text-muted-foreground">Registered Patients</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Doctors</CardTitle>
          <Users className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.doctors}</div>
          <p className="text-xs text-muted-foreground">Registered Doctors</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Researchers</CardTitle>
          <Users className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.researchers}</div>
          <p className="text-xs text-muted-foreground">Registered Researchers</p>
        </CardContent>
      </Card>
    </div>
  );
}
