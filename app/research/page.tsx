'use client';

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
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { Download, Filter, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';

interface ResearchDataset {
  id: string;
  title: string;
  recordCount: number;
  dateRange: string;
  category: string;
  status: 'available' | 'pending';
  verified: number;
  summary?: string;
  riskFactors?: string[];
  recommendations?: string[];
}

// Mock data removed in favor of real API data

export default function ResearchPage() {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<ResearchDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await fetchAPI('/research/datasets');
        setDatasets(data);
      } catch (error) {
        console.error("Failed to fetch research data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'researcher' || user?.role === 'admin') {
      fetchDatasets();
    }
  }, [user]);

  const handleDownload = (dataset: ResearchDataset) => {
    try {
      const dataStr = JSON.stringify(dataset, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dataset-${dataset.category.replace(/\s+/g, '-').toLowerCase()}-${dataset.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download dataset", error);
    }
  };

  if (user?.role !== 'researcher' && user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Only researchers and admins can access this section.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const filteredDatasets =
    selectedCategory === 'all'
      ? datasets
      : datasets.filter((d) => d.category === selectedCategory);

  const categories = ['all', ...new Set(datasets.map((d) => d.category))];

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Research Data</h1>
        <p className="text-muted-foreground mt-1">
          Access anonymized medical datasets for research purposes. All data is blockchain-verified
          for authenticity and has patient consent.
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <FileText className="h-4 w-4" />
        <AlertDescription>
          All datasets contain anonymized patient records verified on the blockchain. You must cite
          the source in your research publications.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {/* Datasets Table */}
      {filteredDatasets.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No datasets found"
          description="There are no datasets available in this category. Try selecting a different category."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Available Datasets</CardTitle>
            <CardDescription>
              {filteredDatasets.length} dataset(s) available for research
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dataset Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDatasets.map((dataset) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium">{dataset.title}</TableCell>
                      <TableCell>{dataset.category}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{dataset.recordCount}</p>
                          <p className="text-xs text-muted-foreground">
                            {dataset.verified} verified
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{dataset.dateRange}</TableCell>
                      <TableCell>
                        {dataset.status === 'available' ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 font-normal">
                            Available
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground font-normal"
                          >
                            Pending Verification
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={dataset.status !== 'available'}
                          onClick={() => handleDownload(dataset)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Records Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {datasets.reduce((sum, d) => sum + d.verified, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Blockchain verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Datasets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {datasets.filter((d) => d.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for research</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(datasets.map((d) => d.category)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Medical specialties</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Policy */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Data Usage Policy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • All data is anonymized and stripped of personally identifiable information (PII)
          </p>
          <p>• Data usage is governed by institutional review board (IRB) approval</p>
          <p>• You must cite HealthChain as the data source in all publications</p>
          <p>• Data sharing or redistribution is strictly prohibited</p>
          <p>• All analysis must comply with HIPAA and local data protection regulations</p>
        </CardContent>
      </Card>
    </div>
  );
}
