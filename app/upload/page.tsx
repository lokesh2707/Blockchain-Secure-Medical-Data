'use client';

import React, { useState, useRef } from "react"
import { useAuth } from '@/lib/auth-context';
import { fetchAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function UploadPage() {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; hash: string; timestamp: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (user?.role !== 'patient') {
    return (
      <div className="p-6 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Only patients can upload medical records.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB max
    });

    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress({});
    setUploadedFiles([]);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress (since fetch doesn't give upload progress easily)
        setUploadProgress((prev) => ({ ...prev, [file.name]: 10 }));

        const response = await fetchAPI('/records/upload', {
          method: 'POST',
          body: formData,
        }).catch(err => {
          console.error(err);
          throw err;
        });

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: response.name,
            hash: response.fileHash,
            timestamp: response.timestamp,
          },
        ]);
      }
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert('Failed to upload one or more files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Medical Records</h1>
        <p className="text-muted-foreground mt-1">
          Upload your medical documents securely. They will be verified and anchored on the blockchain.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Documents</CardTitle>
              <CardDescription>
                Supported formats: PDF, PNG, JPG (Max 10MB each)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent/5'
                    }`}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="font-medium text-foreground mb-1">Drag and drop your files here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click below to browse</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Files
                  </Button>
                  <input
                    id="file-input"
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {files.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Upload className="h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(i)}
                            disabled={isUploading}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading || files.length === 0}
                      className="w-full"
                    >
                      {isUploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-sm">End-to-End Encryption</p>
                <p className="text-xs text-muted-foreground">Your files are encrypted in transit and at rest</p>
              </div>
              <div>
                <p className="font-medium text-sm">Blockchain Verification</p>
                <p className="text-xs text-muted-foreground">Each record is anchored on blockchain for authenticity</p>
              </div>
              <div>
                <p className="font-medium text-sm">Audit Trail</p>
                <p className="text-xs text-muted-foreground">Complete access history and modification logs</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• PDF Documents</li>
                <li>• PNG Images</li>
                <li>• JPEG Images</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">{fileName}</span>
                  <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Complete</CardTitle>
            <CardDescription>Your records have been securely uploaded and verified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground break-all font-mono">
                      Hash: {file.hash}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
