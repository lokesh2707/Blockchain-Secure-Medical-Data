"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, FileText, CheckCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DiseasePatternPage() {
    const { user } = useAuth()
    const [file, setFile] = useState<File | null>(null)
    const [records, setRecords] = useState<any[]>([])
    const [selectedRecordId, setSelectedRecordId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [analysis, setAnalysis] = useState<any | null>(null)

    useEffect(() => {
        if (user) {
            fetchRecords()
        }
    }, [user])

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch("http://localhost:5001/records/my-records", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setRecords(data)
            }
        } catch (err) {
            console.error("Failed to fetch records", err)
        }
    }

    const handleAnalyze = async () => {
        setLoading(true)
        setError(null)
        setAnalysis(null)

        const formData = new FormData()
        if (file) {
            formData.append("file", file)
        } else if (selectedRecordId) {
            formData.append("recordId", selectedRecordId)
        } else {
            setError("Please select a file or an existing record.")
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch("http://localhost:5001/analyze/disease-pattern", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || "Analysis failed")
            }

            const data = await res.json()
            setAnalysis(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Disease Pattern Discovery</h1>
            <p className="text-muted-foreground">Upload a medical document or select an existing record to analyze disease patterns using AI.</p>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Input Source</CardTitle>
                        <CardDescription>Choose a file to analyze</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Upload New File</Label>
                            <Input
                                type="file"
                                accept=".txt,.pdf"
                                onChange={(e) => {
                                    setFile(e.target.files?.[0] || null)
                                    setSelectedRecordId("")
                                }}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or select existing</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Existing Record</Label>
                            <Select
                                value={selectedRecordId}
                                onValueChange={(val) => {
                                    setSelectedRecordId(val)
                                    setFile(null)
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a record" />
                                </SelectTrigger>
                                <SelectContent>
                                    {records.map((r) => (
                                        <SelectItem key={r._id} value={r._id}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || (!file && !selectedRecordId)}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                "Analyze Document"
                            )}
                        </Button>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {analysis && (
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Analysis Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                                <div className="space-y-6">
                                    {analysis.summary && (
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-blue-500" /> Summary
                                            </h3>
                                            <p className="mt-2 text-sm text-muted-foreground">{analysis.summary}</p>
                                        </div>
                                    )}

                                    {analysis.disease_patterns && (
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-red-500" /> Disease Patterns
                                            </h3>
                                            <div className="mt-2 text-sm">
                                                {Array.isArray(analysis.disease_patterns) ? (
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {analysis.disease_patterns.map((item: any, i: number) => (
                                                            <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <pre className="whitespace-pre-wrap">{JSON.stringify(analysis.disease_patterns, null, 2)}</pre>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.risk_factors && (
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-orange-500" /> Risk Factors
                                            </h3>
                                            <div className="mt-2 text-sm">
                                                {Array.isArray(analysis.risk_factors) ? (
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {analysis.risk_factors.map((item: any, i: number) => (
                                                            <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <pre className="whitespace-pre-wrap">{JSON.stringify(analysis.risk_factors, null, 2)}</pre>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.recommendations && (
                                        <div>
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-500" /> Recommendations
                                            </h3>
                                            <div className="mt-2 text-sm">
                                                {Array.isArray(analysis.recommendations) ? (
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {analysis.recommendations.map((item: any, i: number) => (
                                                            <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <pre className="whitespace-pre-wrap">{JSON.stringify(analysis.recommendations, null, 2)}</pre>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
