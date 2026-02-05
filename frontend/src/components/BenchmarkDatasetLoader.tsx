import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
    Gavel, 
    Briefcase, 
    Landmark, 
    Download, 
    Loader2,
    AlertCircle 
} from "lucide-react";
import { cn } from "../lib/utils";

interface BenchmarkDataset {
    name: string;
    description: string;
    filename: string;
    target_column: string;
    sensitive_attributes: string[];
    key_features: string[];
    domain: string;
    reference: string;
}

interface BenchmarkDatasetLoaderProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    onSuccess: (datasetName: string) => void;
}

// Icon mapping using Lucide
const DATASET_ICONS: Record<string, React.ReactElement> = {
    criminal_justice: <Gavel className="w-10 h-10" />,
    employment: <Briefcase className="w-10 h-10" />,
    finance: <Landmark className="w-10 h-10" />
};

// Styling mapping using Tailwind classes instead of MUI color props
const DATASET_STYLES: Record<string, string> = {
    criminal_justice: "text-blue-500",
    employment: "text-purple-500",
    finance: "text-emerald-500"
};

const BENCHMARK_DATASETS: Record<string, BenchmarkDataset> = {
    compas: {
        name: 'COMPAS Recidivism',
        description: 'Criminal recidivism risk assessment dataset from Broward County, Florida. Used to study racial bias in algorithmic risk assessment tools.',
        filename: 'compas-scores-raw.csv',
        target_column: 'two_year_recid',
        sensitive_attributes: ['race', 'sex', 'age_cat'],
        key_features: ['age', 'priors_count', 'c_charge_degree', 'decile_score'],
        domain: 'criminal_justice',
        reference: 'ProPublica COMPAS Analysis (2016)'
    },
    adult_income: {
        name: 'Adult Income (Census)',
        description: 'Census data from 1994 used to predict whether income exceeds $50K/year. Widely used for fairness research.',
        filename: 'adult.csv',
        target_column: 'income',
        sensitive_attributes: ['sex', 'race', 'native-country'],
        key_features: ['age', 'education', 'occupation', 'hours-per-week', 'marital-status'],
        domain: 'employment',
        reference: 'UCI Machine Learning Repository'
    },
    german_credit: {
        name: 'German Credit',
        description: 'Credit risk assessment dataset from a German bank. Used for fairness in lending and ECOA compliance studies.',
        filename: 'german_credit_data.csv',
        target_column: 'credit_risk',
        sensitive_attributes: ['sex', 'age', 'foreign_worker'],
        key_features: ['duration', 'credit_amount', 'installment_rate', 'property', 'existing_credits'],
        domain: 'finance',
        reference: 'UCI Machine Learning Repository - Statlog German Credit'
    }
};

export default function BenchmarkDatasetLoader({
    open,
    onClose,
    projectId,
    onSuccess
}: BenchmarkDatasetLoaderProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingDataset, setLoadingDataset] = useState<string | null>(null);

    const handleLoadDataset = async (datasetKey: string) => {
        setLoading(true);
        setError(null);
        setLoadingDataset(datasetKey);

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/datasets/project/${projectId}/load-benchmark?dataset_key=${datasetKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to load dataset');
            }

            onSuccess(BENCHMARK_DATASETS[datasetKey].name);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
            setLoadingDataset(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !loading && !val && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Load Benchmark Dataset</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <p className="text-sm text-muted-foreground mb-6">
                    Select a pre-configured benchmark dataset to quickly test fairness validation.
                    These datasets are widely used in AI ethics research.
                </p>

                <div className="flex flex-col gap-4">
                    {Object.entries(BENCHMARK_DATASETS).map(([key, dataset]) => (
                        <Card key={key} className="overflow-hidden transition-all hover:border-primary/50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className={cn("mt-1", DATASET_STYLES[dataset.domain])}>
                                        {DATASET_ICONS[dataset.domain]}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-lg font-semibold leading-none tracking-tight">
                                            {dataset.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {dataset.description}
                                        </p>

                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                Sensitive Attributes:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {dataset.sensitive_attributes.map((attr) => (
                                                    <Badge key={attr} variant="secondary" className="text-[10px] px-2 py-0">
                                                        {attr}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            <p>Target: <span className="font-bold text-foreground">{dataset.target_column}</span></p>
                                            <p>Reference: {dataset.reference}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 px-6 py-3 border-t">
                                <Button
                                    onClick={() => handleLoadDataset(key)}
                                    disabled={loading}
                                    className={cn(
                                        "w-full sm:w-auto",
                                        dataset.domain === 'criminal_justice' && "bg-blue-600 hover:bg-blue-700",
                                        dataset.domain === 'employment' && "bg-purple-600 hover:bg-purple-700",
                                        dataset.domain === 'finance' && "bg-emerald-600 hover:bg-emerald-700"
                                    )}
                                >
                                    {loadingDataset === key ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Load Dataset
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}