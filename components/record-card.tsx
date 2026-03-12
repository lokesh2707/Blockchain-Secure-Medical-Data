'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, MoreVertical, Eye, Share2, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface RecordCardProps {
    record: {
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
    };
    userRole?: string;
    onView?: (record: any) => void;
    onShare?: (record: any) => void;
    onRevoke?: (record: any) => void;
    getStatusBadge: (status: string) => React.ReactNode;
}

export function RecordCard({ record, userRole, onView, onShare, onRevoke, getStatusBadge }: RecordCardProps) {
    console.log('RecordCard data:', record); // Debug log

    return (
        <Card>
            {/* Header - Clean Design */}
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{record.name}</CardTitle>
                        <CardDescription className="mt-1">
                            Uploaded {new Date(record.uploadDate).toLocaleDateString()} • {getStatusBadge(record.status)}
                        </CardDescription>
                        {userRole === 'researcher' && record.owner && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Patient: {record.owner.name}
                            </p>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                console.log('View clicked for:', record.id);
                                if (onView) onView(record);
                            }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            {userRole === 'patient' && (
                                <>
                                    <DropdownMenuItem onClick={() => onShare?.(record)}>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </DropdownMenuItem>
                                    {record.status === 'shared' && (
                                        <DropdownMenuItem onClick={() => onRevoke?.(record)}>
                                            <Lock className="mr-2 h-4 w-4" />
                                            Revoke Access
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Disease Tags */}
                {record.diseaseTags && record.diseaseTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {record.diseaseTags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </CardHeader>

            {/* AI Analysis Section */}
            <CardContent className="pt-0">
                {!record.aiAnalyzed ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm italic">AI analysis in progress...</span>
                    </div>
                ) : record.analysis ? (
                    <div className="space-y-3">
                        {/* Summary */}
                        {record.analysis.summary && (
                            <div className="bg-muted/50 p-4 rounded-lg border">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Summary
                                </h4>
                                <p className="text-sm text-foreground/80">{record.analysis.summary}</p>
                            </div>
                        )}

                        {/* Causes */}
                        {record.analysis.causes && record.analysis.causes.length > 0 && (
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-orange-900 dark:text-orange-100">
                                    <AlertCircle className="h-4 w-4" />
                                    Identified Causes
                                </h4>
                                <ul className="space-y-1">
                                    {record.analysis.causes.map((cause, idx) => (
                                        <li key={idx} className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
                                            <span className="text-orange-500 mt-0.5">•</span>
                                            <span>{cause}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Treatments */}
                        {record.analysis.treatments && record.analysis.treatments.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-900 dark:text-green-100">
                                    <CheckCircle className="h-4 w-4" />
                                    Suggested Treatments
                                </h4>
                                <ul className="space-y-1">
                                    {record.analysis.treatments.map((treatment, idx) => (
                                        <li key={idx} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span>{treatment}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic py-4">No AI analysis available yet</p>
                )}

                {/* Blockchain Hash */}
                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                        Blockchain Hash: <code className="bg-muted px-2 py-1 rounded font-mono">{record.hash}</code>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
