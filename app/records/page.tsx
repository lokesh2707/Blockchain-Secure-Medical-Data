'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreVertical, Share2, Eye, Lock, FileText } from 'lucide-react';
import Link from 'next/link';
import { RecordCard } from '@/components/record-card';

interface Record {
  id: string;
  name: string;
  uploadDate: string;
  hash: string;
  status: 'shared' | 'private' | 'verified';
  diseaseTags?: string[];
  aiAnalyzed?: boolean;
  owner?: { name: string; email: string };
  analysis?: {
    summary: string;
    causes: string[];
    treatments: string[];
  };
}

export default function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('patient');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Fetch records
  useEffect(() => {
    if (!user) return;

    const endpoint =
      user.role === 'patient' ? '/records/my-records' :
        user.role === 'researcher' ? '/records/all-records' :
          '/records/shared-with-me'; // doctor

    fetchAPI(endpoint)
      .then(async data => {
        console.log(`📥 Fetched ${data.length} records from ${endpoint}`);

        // Map backend data and fetch analysis
        const mapped = await Promise.all(data.map(async (r: any) => {
          let analysis = null;
          if (r.aiAnalyzed) {
            try {
              console.log(`🔍 Fetching analysis for record ${r._id}...`);
              const researchData = await fetchAPI(`/research/by-record/${r._id}`);
              console.log(`✓ Got research data:`, researchData);
              if (researchData) {
                analysis = {
                  summary: researchData.summary || '',
                  causes: researchData.riskFactors || [],
                  treatments: researchData.recommendations || []
                };
                console.log(`✓ Mapped analysis:`, analysis);
              }
            } catch (err) {
              console.log(`❌ No analysis for ${r._id}:`, err);
            }
          } else {
            console.log(`⏳ Record ${r._id} not yet analyzed`);
          }
          return {
            id: r._id,
            name: r.name,
            uploadDate: r.timestamp,
            hash: r.fileHash ? r.fileHash.substring(0, 10) + '...' : '...',
            status: r.status || 'verified',
            fullHash: r.fileHash,
            diseaseTags: r.diseaseTags || [],
            aiAnalyzed: r.aiAnalyzed || false,
            owner: r.owner,
            analysis
          };
        }));
        console.log(`✅ Final mapped records:`, mapped);
        setRecords(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleShare = async (record: Record) => {
    setSelectedRecord(record);
    setIsShareDialogOpen(true);
  };

  const handleConfirmShare = async () => {
    if (selectedRecord && shareEmail) {
      try {
        await fetchAPI('/records/share', {
          method: 'POST',
          body: JSON.stringify({
            recordId: selectedRecord.id,
            email: shareEmail,
            role: shareRole
          })
        });
        alert('Shared successfully');
        setIsShareDialogOpen(false);
        setShareEmail('');
      } catch (err: any) {
        alert(err.message || 'Failed to share');
      }
    }
  };

  const handleRevoke = (record: Record) => {
    // Mock revoke - in production, call API
    console.log(`Revoking access for ${record.name}`);
    setRecords(records.map((r) => (r.id === record.id ? { ...r, status: 'private' } : r)));
  };

  const handleView = async (record: Record) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5001/records/access/${record.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      alert(err.message || 'Error viewing file');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: {
        label: 'Verified',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      },
      shared: {
        label: 'Shared',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      },
      private: {
        label: 'Private',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Medical Records</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'patient'
              ? 'View and manage your medical documents'
              : 'Access shared medical records from your patients'}
          </p>
        </div>
        {user?.role === 'patient' && (
          <Link href="/upload">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Upload New
            </Button>
          </Link>
        )}
      </div>

      {/* Records Display */}
      {records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No records yet"
          description={
            user?.role === 'patient'
              ? 'Start by uploading your medical documents'
              : 'You have no access to patient records yet'
          }
          actionLabel={user?.role === 'patient' ? 'Upload Record' : undefined}
          actionHref={user?.role === 'patient' ? '/upload' : undefined}
        />
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              userRole={user?.role}
              onView={handleView}
              onShare={handleShare}
              onRevoke={handleRevoke}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Record</DialogTitle>
            <DialogDescription>
              Grant access to your medical record "{selectedRecord?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-email">Email Address</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="doctor@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-role">Recipient Role</Label>
              <Select value={shareRole} onValueChange={setShareRole}>
                <SelectTrigger id="share-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                The recipient will receive a notification and can access your record with your consent.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmShare}>Confirm & Share</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
