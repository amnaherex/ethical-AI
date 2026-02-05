import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    ArrowLeft, 
    TrendingUp, 
    BarChart3, 
    Info, 
    Eye, 
    CheckCircle2, 
    XCircle,
    Loader2
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell 
} from 'recharts';

// Shadcn UI Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { validationApi } from '../services/api';

// Interfaces remain identical
interface FeatureImportance {
    [feature: string]: number;
}

interface ModelCard {
    model_details: {
        name: string;
        description?: string;
        model_type: string;
        n_features: number;
        feature_names?: string[];
    };
    intended_use?: {
        primary_use: string;
        users?: string;
    };
    performance_metrics: {
        accuracy: number;
        precision: number;
        recall: number;
        f1_score: number;
    };
    additional_info?: any;
}

interface TransparencyData {
    validation_id: string;
    status: string;
    mlflow_run_id: string;
    feature_importance: FeatureImportance;
    model_card: ModelCard;
    sample_predictions: Array<{
        sample_index: number;
        true_label: number;
        predicted_label: number;
        correct: boolean;
        top_features: Record<string, {
            value: number;
            shap_contribution: number;
        }>;
        base_value: number;
    }>;
    completed_at: string;
}

export default function TransparencyDetailPage() {
    const { validationId } = useParams<{ validationId: string }>();
    const navigate = useNavigate();

    const { data: transparencyData, isLoading, error } = useQuery<TransparencyData>({
        queryKey: ['transparencyDetails', validationId],
        queryFn: () => validationApi.getTransparencyDetails(validationId!),
        enabled: !!validationId,
        retry: 1,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !transparencyData) {
        return (
            <div className="p-6 space-y-4">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load transparency details: {error instanceof Error ? error.message : 'Unknown error'}
                    </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const hasFeatureImportance = transparencyData.feature_importance && Object.keys(transparencyData.feature_importance).length > 0;
    const hasModelCard = transparencyData.model_card && transparencyData.model_card.performance_metrics;

    if (!hasFeatureImportance && !hasModelCard) {
        return (
            <div className="p-6 space-y-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Notice</AlertTitle>
                    <AlertDescription>
                        No transparency data available yet. The validation may still be processing.
                    </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
                <div className="mt-4 p-4 bg-muted rounded-md overflow-auto">
                    <p className="text-xs font-mono">Debug info: {JSON.stringify(transparencyData, null, 2)}</p>
                </div>
            </div>
        );
    }

    const chartData = hasFeatureImportance 
        ? Object.entries(transparencyData.feature_importance)
            .slice(0, 10)
            .map(([name, value]) => ({
                name: name.length > 15 ? name.substring(0, 15) + '...' : name,
                importance: Math.abs(value) * 100,
                fullName: name,
            }))
        : [];

    const topFeatures = hasFeatureImportance 
        ? Object.entries(transparencyData.feature_importance).slice(0, 5)
        : [];

    const metrics = hasModelCard ? transparencyData.model_card.performance_metrics : null;

    const getColor = (index: number) => {
        const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
        return colors[Math.min(index, colors.length - 1)];
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Transparency Analysis</h1>
                        <p className="text-muted-foreground">Model explainability using SHAP feature importance</p>
                    </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 flex gap-2">
                    <BarChart3 className="h-4 w-4" /> {transparencyData.status}
                </Badge>
            </div>

            {/* Feature Importance Section */}
            {hasFeatureImportance && chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-primary h-5 w-5" />
                            <CardTitle>Feature Importance (SHAP Values)</CardTitle>
                        </div>
                        <CardDescription>
                            Shows which features have the most influence on the model's predictions overall.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                                    <Tooltip
                                        content={({ payload }) => {
                                            if (payload && payload[0]) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-background border p-2 rounded shadow-sm">
                                                        <p className="font-bold text-xs">{data.fullName}</p>
                                                        <p className="text-primary text-xs font-semibold">Importance: {data.importance.toFixed(2)}%</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={getColor(index)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Feature Rankings</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">Rank</TableHead>
                                            <TableHead>Feature Name</TableHead>
                                            <TableHead className="text-right">Importance</TableHead>
                                            <TableHead className="w-[200px]">Visual</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topFeatures.map(([name, value], index) => {
                                            const percentage = Math.abs(value) * 100;
                                            return (
                                                <TableRow key={name}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell className="font-medium">{name}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline" className="border-primary text-primary">
                                                            {percentage.toFixed(2)}%
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Progress value={percentage} className="h-2" />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Performance & Model Card Row */}
            {hasModelCard && metrics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Model Performance */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="text-green-600 h-5 w-5" />
                                <CardTitle>Model Performance</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Accuracy', val: metrics.accuracy, color: 'bg-green-50 text-green-700' },
                                    { label: 'Precision', val: metrics.precision, color: 'bg-blue-50 text-blue-700' },
                                    { label: 'Recall', val: metrics.recall, color: 'bg-orange-50 text-orange-700' },
                                    { label: 'F1-Score', val: metrics.f1_score, color: 'bg-purple-50 text-purple-700' },
                                ].map((m) => (
                                    <div key={m.label} className={`p-4 rounded-lg text-center ${m.color}`}>
                                        <p className="text-2xl font-bold">{(m.val * 100).toFixed(1)}%</p>
                                        <p className="text-xs uppercase tracking-wider font-semibold opacity-70">{m.label}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Model Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Info className="text-blue-500 h-5 w-5" />
                                <CardTitle>Model Card</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Model Details</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-bold">Name:</span> {transparencyData.model_card.model_details.name}</p>
                                    <p><span className="font-bold">Type:</span> {transparencyData.model_card.model_details.model_type}</p>
                                    <p><span className="font-bold">Features:</span> {transparencyData.model_card.model_details.n_features}</p>
                                </div>
                            </div>
                            
                            {transparencyData.model_card.intended_use && (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Intended Use</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-bold">Primary:</span> {transparencyData.model_card.intended_use.primary_use}</p>
                                        {transparencyData.model_card.intended_use.users && (
                                            <p><span className="font-bold">Users:</span> {transparencyData.model_card.intended_use.users}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-muted-foreground font-mono">MLflow Run ID: {transparencyData.mlflow_run_id}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Insights Card */}
            {hasFeatureImportance && topFeatures.length > 0 && (
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Eye className="text-primary h-5 w-5" />
                            <h3 className="font-semibold text-lg">Key Insights</h3>
                        </div>
                        <Alert className="bg-white border-blue-200">
                            <div className="text-sm">
                                <p className="font-bold mb-2">Top 3 Most Important Features:</p>
                                <ol className="list-decimal pl-5 space-y-1">
                                    {topFeatures.slice(0, 3).map(([name, value]) => (
                                        <li key={name}>
                                            <span className="font-semibold">{name}</span>: {(Math.abs(value) * 100).toFixed(2)}% importance
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </Alert>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            💡 <strong>What this means:</strong> The model relies most heavily on <strong>{topFeatures[0][0]}</strong> when making predictions. 
                            Features with higher importance have a greater influence on the model's decisions.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Sample Predictions Section */}
            {transparencyData.sample_predictions && transparencyData.sample_predictions.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="text-primary h-5 w-5" />
                        <h2 className="text-xl font-bold">Sample Predictions with Explanations</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Below are {transparencyData.sample_predictions.length} example predictions showing how specific features contributed to each decision.
                    </p>

                    <div className="flex flex-col gap-4">
                        {transparencyData.sample_predictions.map((sample, idx) => {
                            const featureEntries = Object.entries(sample.top_features);
                            const maxAbsContribution = Math.max(
                                ...featureEntries.map(([_, data]) => Math.abs(data.shap_contribution))
                            );

                            return (
                                <Card key={idx} className={`border-2 ${sample.correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                            <div className="space-y-2">
                                                <h4 className="font-bold">Sample #{sample.sample_index}</h4>
                                                <div className="flex gap-2">
                                                    <Badge variant="default">Predicted: {sample.predicted_label}</Badge>
                                                    <Badge variant="outline" className="bg-white">Actual: {sample.true_label}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Base value: {sample.base_value.toFixed(3)}</p>
                                            </div>
                                            <Badge className={sample.correct ? 'bg-green-600' : 'bg-red-600'}>
                                                {sample.correct ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                                {sample.correct ? 'Correct' : 'Incorrect'}
                                            </Badge>
                                        </div>

                                        <h5 className="text-sm font-semibold mb-3">Top Contributing Features:</h5>
                                        <div className="space-y-4">
                                            {featureEntries.map(([featureName, data]) => {
                                                const isPositive = data.shap_contribution > 0;
                                                const barWidth = (Math.abs(data.shap_contribution) / maxAbsContribution) * 100;

                                                return (
                                                    <div key={featureName} className="space-y-1">
                                                        <div className="flex justify-between text-xs font-medium">
                                                            <span>{featureName}</span>
                                                            <span className="text-muted-foreground">Value: {typeof data.value === 'number' ? data.value.toFixed(2) : data.value}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${barWidth}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-bold w-12 text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                                {isPositive ? '+' : ''}{data.shap_contribution.toFixed(3)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Debug Section */}
            <Card className="bg-slate-100 border-dashed">
                <CardContent className="pt-6">
                    <h4 className="text-sm font-bold mb-2">Debug Info</h4>
                    <pre className="text-[10px] overflow-auto max-h-40 p-2 bg-black text-green-400 rounded">
                        {JSON.stringify({
                            hasSamplePredictions: !!transparencyData.sample_predictions,
                            count: transparencyData.sample_predictions?.length || 0,
                            data: transparencyData.sample_predictions
                        }, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}