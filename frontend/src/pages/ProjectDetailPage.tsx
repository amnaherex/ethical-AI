import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    ShieldAlert, 
    ShieldCheck, 
    Lock, 
    AlertTriangle, 
    CheckCircle2, 
    Info, 
    Loader2 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { validationApi } from '../services/api';

// UI Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";

interface PIIResult {
    column_name: string;
    is_pii: boolean;
    pii_type: string | null;
    confidence: number;
    sample_matches: string[];
    detection_method: string;
    details: string;
}

export default function PrivacyDetailPage() {
    const { validationId } = useParams<{ validationId: string }>();
    const navigate = useNavigate();

    const { data: privacyData, isLoading, error } = useQuery({
        queryKey: ['privacyDetails', validationId],
        queryFn: () => validationApi.getPrivacyDetails(validationId!),
        enabled: !!validationId,
        retry: 1,
    });

    if (isLoading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error || !privacyData) {
        return (
            <div className="container max-w-4xl py-10">
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error instanceof Error ? error.message : 'Failed to load privacy details'}
                    </AlertDescription>
                </Alert>
                <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const piiDetected = privacyData.pii_results?.filter((pii: PIIResult) => pii.is_pii) || [];

    return (
        <div className="container max-w-6xl py-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="mb-8 space-y-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Validation
                </Button>
                
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-orange-500/10 p-3 ring-1 ring-orange-500/20">
                        <Lock className="h-8 w-8 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Privacy Validation</h1>
                        <p className="text-sm text-muted-foreground font-mono">ID: {validationId}</p>
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                {/* Overall Status Banner */}
                <Card className={`border-none ${privacyData.overall_passed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium opacity-70">Security Posture</p>
                            <h3 className="text-xl font-bold">Overall Privacy Compliance</h3>
                        </div>
                        <Badge className={`px-4 py-1.5 text-sm font-bold shadow-lg ${
                            privacyData.overall_passed ? 'bg-green-600 hover:bg-green-600' : 'bg-red-600 hover:bg-red-600'
                        }`}>
                            {privacyData.overall_passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                    </CardContent>
                </Card>

                {/* PII Detection */}
                <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {piiDetected.length === 0 ? <CheckCircle2 className="text-green-500" /> : <AlertTriangle className="text-red-500" />}
                            PII Detection Results
                        </CardTitle>
                        <CardDescription>Scanning for Personally Identifiable Information across all features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {piiDetected.length === 0 ? (
                            <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-green-400">
                                <ShieldCheck className="h-5 w-5" />
                                <span className="text-sm font-medium">No PII detected. Data is sanitized.</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Alert variant="destructive" className="bg-red-500/5 border-red-500/20">
                                    <AlertDescription className="text-red-400">
                                        Found {piiDetected.length} column(s) containing sensitive identifiers.
                                    </AlertDescription>
                                </Alert>
                                <div className="rounded-md border border-white/5">
                                    <Table>
                                        <TableHeader className="bg-white/5">
                                            <TableRow>
                                                <TableHead>Column</TableHead>
                                                <TableHead>PII Type</TableHead>
                                                <TableHead>Confidence</TableHead>
                                                <TableHead className="text-right">Method</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {piiDetected.map((pii: PIIResult, idx: number) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="font-bold">{pii.column_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 uppercase text-[10px]">
                                                            {pii.pii_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{(pii.confidence * 100).toFixed(0)}%</TableCell>
                                                    <TableCell className="text-right text-muted-foreground text-xs">{pii.detection_method}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* k-Anonymity Analysis */}
                {privacyData.k_anonymity && (
                    <Card className="border-white/5 bg-card/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {privacyData.k_anonymity.satisfies_k ? <CheckCircle2 className="text-green-500" /> : <AlertTriangle className="text-red-500" />}
                                $k$-Anonymity Analysis
                            </CardTitle>
                            <CardDescription>Quantifying the risk of re-identification through quasi-identifiers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { label: "Target $k$", value: privacyData.k_anonymity.k_value },
                                    { 
                                        label: "Measured Min $k$", 
                                        value: privacyData.k_anonymity.actual_min_k,
                                        status: privacyData.k_anonymity.satisfies_k ? "text-green-400" : "text-red-400" 
                                    },
                                    { 
                                        label: "Violating Groups", 
                                        value: `${privacyData.k_anonymity.violating_groups_count} / ${privacyData.k_anonymity.total_groups}`,
                                        status: "text-red-400"
                                    }
                                ].map((stat, i) => (
                                    <div key={i} className="rounded-xl border border-white/5 bg-black/20 p-4">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.status || ""}`}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Quasi-identifiers Checked</p>
                                <div className="flex flex-wrap gap-2">
                                    {privacyData.k_anonymity.quasi_identifiers.map((qi: string) => (
                                        <Badge key={qi} variant="secondary" className="bg-white/5 hover:bg-white/10">{qi}</Badge>
                                    ))}
                                </div>
                            </div>

                            {privacyData.k_anonymity.violating_groups.length > 0 && (
                                <div className="space-y-3">
                                    <Separator className="bg-white/5" />
                                    <p className="text-sm font-medium text-red-400">Groups at high risk of identification:</p>
                                    <div className="overflow-hidden rounded-md border border-white/5">
                                        <Table>
                                            <TableHeader className="bg-red-500/5">
                                                <TableRow>
                                                    {privacyData.k_anonymity.quasi_identifiers.map((qi: string) => (
                                                        <TableHead key={qi} className="text-[11px] uppercase">{qi}</TableHead>
                                                    ))}
                                                    <TableHead className="text-right">Frequency</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {privacyData.k_anonymity.violating_groups.slice(0, 5).map((group: any, idx: number) => (
                                                    <TableRow key={idx} className="hover:bg-white/5">
                                                        {privacyData.k_anonymity!.quasi_identifiers.map((qi: string) => (
                                                            <TableCell key={qi} className="text-xs">{String(group[qi])}</TableCell>
                                                        ))}
                                                        <TableCell className="text-right">
                                                            <Badge variant="destructive" className="h-5 text-[10px]">{group.count}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Recommendations & Warnings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {privacyData.recommendations?.length > 0 && (
                        <Card className="border-white/5 bg-indigo-500/5">
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Info className="h-4 w-4 text-indigo-400" /> Mitigation Steps
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {privacyData.recommendations.map((rec: string, idx: number) => (
                                        <li key={idx} className="text-xs leading-relaxed border-l-2 border-indigo-500/30 pl-3 py-1 font-mono text-indigo-100/80">
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {privacyData.warnings?.length > 0 && (
                        <Card className="border-white/5 bg-orange-500/5">
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2 text-orange-400">
                                    <AlertTriangle className="h-4 w-4" /> System Warnings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {privacyData.warnings.map((warning: string, idx: number) => (
                                    <div key={idx} className="text-xs bg-orange-500/10 text-orange-200/70 p-2 rounded border border-orange-500/20">
                                        {warning}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}