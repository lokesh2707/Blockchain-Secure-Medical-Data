'use client';

import { useAuth } from '@/lib/auth-context';
import { fetchAPI } from '@/lib/api';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, ScanLineIcon as ChainLinkIcon } from 'lucide-react';
import { useState } from 'react';

interface BlockchainBlock {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: string;
  recordCount: number;
  verified: boolean;
}

export default function BlockchainPage() {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    fetchAPI('/blockchain/ledger')
      .then(data => {
        const mapped = data.map((b: any) => ({
          id: b.id.toString(),
          hash: b.dataHash,
          previousHash: b.previousHash,
          timestamp: b.timestamp,
          recordCount: b.recordCount,
          verified: b.verified
        }));
        setBlocks(mapped);
      })
      .catch(console.error);
  }, []);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Blockchain Ledger</h1>
        <p className="text-muted-foreground mt-1">
          View the immutable audit trail of all medical records verified on the blockchain
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ChainLinkIcon className="h-4 w-4 text-primary" />
              Total Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blocks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {blocks.reduce((sum, b) => sum + b.recordCount, 0)} total records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Verified Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {blocks.reduce((sum, b) => sum + b.recordCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All blocks verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Block</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blocks.length > 0 ? `Block #${blocks[0].id}` : 'No blocks'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {blocks.length > 0 ? new Date(blocks[0].timestamp).toLocaleString() : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Timeline</CardTitle>
          <CardDescription>Complete audit trail of all records on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="relative pb-4">
                {/* Timeline connector */}
                {index < blocks.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-border" />
                )}

                {/* Block Card */}
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1 flex-shrink-0">
                    <div className="h-4 w-4 rounded-full bg-primary border-2 border-background" />
                  </div>

                  {/* Block Content */}
                  <div className="flex-1 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">Block #{block.id}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(block.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 font-normal">
                        Verified
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Hash Display */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Block Hash
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-3 py-2 rounded flex-1 overflow-x-auto text-foreground font-mono">
                            {block.hash}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleCopyHash(block.hash)}
                          >
                            {copiedHash === block.hash ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Previous Hash */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Previous Hash
                        </p>
                        <code className="text-xs bg-muted px-3 py-2 rounded block overflow-x-auto text-foreground font-mono">
                          {block.previousHash}
                        </code>
                      </div>

                      {/* Record Count */}
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Records in Block
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {block.recordCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Status</p>
                          <p className="text-sm font-semibold text-green-600">
                            ✓ Immutable
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">How Blockchain Verification Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">1. Record Upload:</strong> When you upload a medical
            record, its digital fingerprint (hash) is recorded.
          </p>
          <p>
            <strong className="text-foreground">2. Block Creation:</strong> Multiple records are
            grouped into blocks that reference the previous block, creating an immutable chain.
          </p>
          <p>
            <strong className="text-foreground">3. Verification:</strong> Any modification to a
            record would change its hash, breaking the chain and revealing tampering.
          </p>
          <p>
            <strong className="text-foreground">4. Audit Trail:</strong> The complete history is
            available for transparency and compliance with healthcare regulations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
