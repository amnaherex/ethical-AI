import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    Scale,
    Eye,
    Lock,
    ClipboardList,
    CheckCircle,
    XCircle,
    Play,
    RefreshCw,
    AlertTriangle,
} from 'lucide-react';
import { modelsApi, datasetsApi, validationApi } from '../services/api';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Loader2 } from 'lucide-react';

export default function ValidationPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const viewSuiteId = searchParams.get('suite');

    // Form state
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedDataset, setSelectedDataset] = useState('');
    const [sensitiveFeature, setSensitiveFeature] = useState('');
    const [targetColumn, setTargetColumn] = useState('');
    const [quasiIdentifiers, setQuasiIdentifiers] = useState<string[]>([]);
    const [sensitiveAttribute, setSensitiveAttribute] = useState('');
    const [error, setError] = useState('');

    // Validation state
    const [isRunning, setIsRunning] = useState(false);
    const [taskId, setTaskId] = useState('');
    const [suiteId, setSuiteId] = useState('');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [results, setResults] = useState<any>(null);

    // Warning dialog state
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [pendingSubmit, setPendingSubmit] = useState(false);

    // Load existing validation results if suite ID is provided
    useEffect(() => {
        if (viewSuiteId) {
            loadSuiteResults(viewSuiteId);
        }
    }, [viewSuiteId]);

    const loadSuiteResults = async (suite_id: string) => {
        try {
            const suiteResults = await validationApi.getSuiteResults(suite_id);
            setResults(suiteResults);
            setSuiteId(suite_id);
        } catch (err: any) {
            console.error('Error loading suite results:', err);
            setError(err.message || 'Failed to load validation results');
        }
    };

    // Fetch models and datasets
    const { data: models } = useQuery({
        queryKey: ['models', id],
        queryFn: () => modelsApi.list(id!),
        enabled: !!id,
    });

    const { data: datasets } = useQuery({
        queryKey: ['datasets', id],
        queryFn: () => datasetsApi.list(id!),
        enabled: !!id,
    });

    // Get selected dataset for column info
    const selectedDatasetObj = datasets?.find((d: any) => d.id === selectedDataset);

    // Poll task status
    useEffect(() => {
        if (!taskId || !isRunning) return;

        const interval = setInterval(async () => {
            try {
                const status = await validationApi.getTaskStatus(taskId);

                setProgress(status.progress);
                setCurrentStep(status.current_step || '');

                if (status.state === 'SUCCESS') {
                    // Task completed, fetch results
                    if (suiteId) {
                        const suiteResults = await validationApi.getSuiteResults(suiteId);
                        setResults(suiteResults);
                    }
                    setIsRunning(false);
                    clearInterval(interval);
                } else if (status.state === 'FAILURE') {
                    setError(status.error || 'Validation failed');
                    setIsRunning(false);
                    clearInterval(interval);
                }
            } catch (err: any) {
                console.error('Error polling status:', err);
                setError(err.message);
                setIsRunning(false);
                clearInterval(interval);
            }
        }, 4000); // Poll every 4 seconds

        return () => clearInterval(interval);
    }, [taskId, isRunning, suiteId]);

    const handleRunAllValidations = async () => {
        // If this is the initial click (not from dialog confirmation) and no target column
        if (!pendingSubmit && !targetColumn) {
            setPendingSubmit(true);
            setShowWarningDialog(true);
            return; // Show warning dialog instead of proceeding
        }

        setError('');

        // Validation
        if (!selectedModel || !selectedDataset) {
            setError('Please select both a model and dataset');
            return;
        }
        if (!sensitiveFeature) {
            setError('Please specify sensitive feature');
            return;
        }

        setIsRunning(true);
        setProgress(0);
        setCurrentStep('Queuing validations...');
        setResults(null);

        try {
            const response = await validationApi.runAll({
                model_id: selectedModel,
                dataset_id: selectedDataset,
                fairness_config: {
                    sensitive_feature: sensitiveFeature,
                    target_column: targetColumn || null, // Allow null
                    thresholds: {
                        demographic_parity_ratio: 0.8,
                        equalized_odds_ratio: 0.8,
                        disparate_impact_ratio: 0.8,
                    },
                },
                transparency_config: {
                    target_column: targetColumn || null, // Allow null
                    sample_size: 100,
                },
                privacy_config: {
                    k_anonymity_k: 5,
                    l_diversity_l: 2,
                    quasi_identifiers: quasiIdentifiers.length > 0 ? quasiIdentifiers : undefined,
                    sensitive_attribute: sensitiveAttribute || undefined,
                },
            });

            setTaskId(response.task_id);
            setSuiteId(response.suite_id);
            setCurrentStep('Validation suite queued');
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message);
            setIsRunning(false);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setTaskId('');
        setSuiteId('');
        setProgress(0);
        setCurrentStep('');
        setResults(null);
        setError('');
    };

    return (
        <>
            {/* Warning Dialog for Missing Target Column */}
            <Dialog
                open={showWarningDialog}
                onOpenChange={(open) => {
                    setShowWarningDialog(open);
                    if (!open) setPendingSubmit(false);
                }}
            >
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-yellow-600">
                            <AlertTriangle className="h-5 w-5" />
                            Warning: No Target Column Specified
                        </DialogTitle>
                        <DialogDescription className="space-y-4 pt-4">
                            <p>
                                You have not specified a target column (ground truth). The validation will proceed using <strong>model predictions as the ground truth</strong>.
                            </p>
                            <div>
                                <p className="font-semibold mb-2">This means:</p>
                                <ul className="list-disc pl-5 space-y-1.5">
                                    <li>
                                        The fairness analysis will check if the model's predictions are <strong>internally consistent</strong> across groups
                                    </li>
                                    <li>
                                        It will NOT compare predictions to actual outcomes
                                    </li>
                                    <li>
                                        Results may be <strong>inaccurate or misleading</strong> without ground truth
                                    </li>
                                </ul>
                            </div>
                            <p className="text-red-600 font-semibold">
                                Are you sure you want to proceed without providing the target column?
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowWarningDialog(false);
                                setPendingSubmit(false);
                            }}
                        >
                            Cancel - Add Target Column
                        </Button>
                        <Button
                            variant="default"
                            className="bg-yellow-600 hover:bg-yellow-700"
                            onClick={() => {
                                setShowWarningDialog(false);
                                setPendingSubmit(false);
                                handleRunAllValidations();
                            }}
                        >
                            Proceed Without Target
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="container mx-auto max-w-7xl py-8 px-4">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/projects/${id}`)}
                        className="mr-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-4xl font-bold">Ethical AI Validation Suite</h1>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setError('')}
                            >
                                ✕
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Configuration Form */}
                {!isRunning && !results && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Configure Validation Suite</CardTitle>
                            <CardDescription>
                                This will run all 4 ethical validations: Fairness, Transparency, Privacy, and Accountability
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Model Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                                        <SelectTrigger id="model">
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {models?.map((model: any) => (
                                                <SelectItem key={model.id} value={model.id}>
                                                    {model.name} ({model.model_type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dataset Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="dataset">Dataset</Label>
                                    <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                                        <SelectTrigger id="dataset">
                                            <SelectValue placeholder="Select a dataset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {datasets?.map((dataset: any) => (
                                                <SelectItem key={dataset.id} value={dataset.id}>
                                                    {dataset.name} ({dataset.row_count} rows)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sensitive Feature */}
                                <div className="space-y-2">
                                    <Label htmlFor="sensitive-feature">Sensitive Feature (for Fairness)</Label>
                                    <Select
                                        value={sensitiveFeature}
                                        onValueChange={setSensitiveFeature}
                                        disabled={!selectedDataset}
                                    >
                                        <SelectTrigger id="sensitive-feature">
                                            <SelectValue placeholder="Select sensitive feature" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedDatasetObj?.columns?.map((col: string) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Target Column */}
                                <div className="space-y-2">
                                    <Label htmlFor="target-column">Target Column (Optional)</Label>
                                    <Select
                                        value={targetColumn || "__none__"}
                                        onValueChange={(val) => setTargetColumn(val === "__none__" ? "" : val)}
                                        disabled={!selectedDataset}
                                    >
                                        <SelectTrigger id="target-column">
                                            <SelectValue placeholder="None - Use model predictions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                <em>None - Use model predictions</em>
                                            </SelectItem>
                                            {selectedDatasetObj?.columns?.map((col: string) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!targetColumn && (
                                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Without target column, fairness will be checked using model predictions
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quasi Identifiers */}
                                <div className="space-y-2">
                                    <Label htmlFor="quasi-identifiers">Quasi-Identifiers (Optional, for Privacy)</Label>
                                    <Select
                                        value={quasiIdentifiers.join(',')}
                                        onValueChange={(value) => setQuasiIdentifiers(value ? value.split(',') : [])}
                                        disabled={!selectedDataset}
                                    >
                                        <SelectTrigger id="quasi-identifiers">
                                            <SelectValue placeholder="Select quasi-identifiers">
                                                {quasiIdentifiers.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {quasiIdentifiers.map((value) => (
                                                            <Badge key={value} variant="secondary" className="text-xs">
                                                                {value}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    "Select quasi-identifiers"
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedDatasetObj?.columns?.map((col: string) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sensitive Attribute */}
                                <div className="space-y-2">
                                    <Label htmlFor="sensitive-attribute">Sensitive Attribute (Optional, for Privacy)</Label>
                                    <Select
                                        value={sensitiveAttribute || "__none__"}
                                        onValueChange={(val) => setSensitiveAttribute(val === "__none__" ? "" : val)}
                                        disabled={!selectedDataset}
                                    >
                                        <SelectTrigger id="sensitive-attribute">
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">None</SelectItem>
                                            {selectedDatasetObj?.columns?.map((col: string) => (
                                                <SelectItem key={col} value={col}>
                                                    {col}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    size="lg"
                                    onClick={handleRunAllValidations}
                                    disabled={!selectedModel || !selectedDataset || !sensitiveFeature}
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Run All Validations
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Progress Indicator */}
                {isRunning && (
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center mb-4">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                <h2 className="text-xl font-semibold">Running Validations...</h2>
                            </div>
                            <Progress value={progress} className="mb-4 h-2" />
                            <p className="text-sm text-muted-foreground">
                                {currentStep} ({progress}%)
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {results && (
                    <div>
                        <Alert className={`mb-6 ${results.overall_passed ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
                            {results.overall_passed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-yellow-600" />
                            )}
                            <AlertTitle className="text-lg font-semibold">
                                Validation Suite {results.overall_passed ? 'Passed' : 'Failed'}
                            </AlertTitle>
                            <AlertDescription>
                                Suite ID: {results.suite_id}
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Fairness Validation */}
                            {results.validations?.fairness && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center mb-4">
                                            <Scale className="h-8 w-8 text-green-600 mr-3" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">Fairness Validation</h3>
                                                <Badge
                                                    variant={results.validations.fairness.status === 'completed' ? 'default' : 'secondary'}
                                                    className="mt-1"
                                                >
                                                    {results.validations.fairness.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Progress: {results.validations.fairness.progress}%
                                        </p>

                                        {/* Display detailed metrics if available */}
                                        {results.validations.fairness.results && results.validations.fairness.results.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold mb-2">Metrics:</h4>
                                                {results.validations.fairness.results.map((metric: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center mb-2">
                                                        <span className="text-sm">
                                                            {metric.metric_name.replace(/_/g, ' ')}
                                                        </span>
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-xs text-muted-foreground">
                                                                {metric.metric_value?.toFixed(3)} / {metric.threshold}
                                                            </span>
                                                            <Badge
                                                                variant={metric.passed ? 'default' : 'destructive'}
                                                                className="min-w-[30px] h-5"
                                                            >
                                                                {metric.passed ? '✓' : '✗'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {results.validations.fairness.mlflow_run_id && (
                                            <p className="text-xs text-muted-foreground mt-4">
                                                MLflow Run: {results.validations.fairness.mlflow_run_id.substring(0, 8)}...
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Transparency Validation */}
                            {results.validations?.transparency && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center mb-4">
                                            <Eye className="h-8 w-8 text-blue-600 mr-3" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">Transparency Validation</h3>
                                                <Badge
                                                    variant={results.validations.transparency.status === 'completed' ? 'default' : 'secondary'}
                                                    className="mt-1"
                                                >
                                                    {results.validations.transparency.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Progress: 100%
                                        </p>

                                        {/* Feature Importance */}
                                        {results.validations.transparency.global_importance && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold mb-2">
                                                    Top Feature Importances:
                                                </h4>
                                                {Object.entries(results.validations.transparency.global_importance)
                                                    .sort(([, a]: any, [, b]: any) => b - a)
                                                    .slice(0, 5)
                                                    .map(([feature, importance]: any) => (
                                                        <div key={feature} className="flex justify-between mb-1">
                                                            <span className="text-xs">{feature}:</span>
                                                            <span className="text-xs font-semibold">
                                                                {(importance * 100).toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Model Card Metrics */}
                                        {results.validations.transparency.model_card?.performance_metrics && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold mb-2">
                                                    Model Performance:
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(results.validations.transparency.model_card.performance_metrics).map(([metric, value]: any) => (
                                                        <Badge
                                                            key={metric}
                                                            variant="outline"
                                                        >
                                                            {metric}: {(value * 100).toFixed(1)}%
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {results.validations.transparency.mlflow_run_id && (
                                            <p className="text-xs text-muted-foreground mt-4">
                                                MLflow Run: {results.validations.transparency.mlflow_run_id.substring(0, 8)}...
                                            </p>
                                        )}

                                        <Button
                                            variant="outline"
                                            className="w-full mt-4"
                                            onClick={() => navigate(`/validations/${results.suite_id}/transparency`)}
                                        >
                                            View Detailed Transparency Report
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Privacy Validation */}
                            {results.validations?.privacy && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center mb-4">
                                            <Lock className="h-8 w-8 text-orange-600 mr-3" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">Privacy Validation</h3>
                                                <Badge
                                                    variant={results.validations.privacy.status === 'completed' ? 'default' : 'secondary'}
                                                    className="mt-1"
                                                >
                                                    {results.validations.privacy.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Progress: 100%
                                        </p>

                                        {/* PII Detection */}
                                        {results.validations.privacy.pii_detected && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold mb-2">
                                                    PII Detection:
                                                </h4>
                                                <p className={`text-sm ${results.validations.privacy.pii_detected.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {results.validations.privacy.pii_detected.length > 0 
                                                        ? `⚠️ ${results.validations.privacy.pii_detected.length} column(s) with PII detected`
                                                        : '✓ No PII detected'}
                                                </p>
                                                {results.validations.privacy.pii_detected.length > 0 && (
                                                    <div className="mt-2 pl-4">
                                                        {results.validations.privacy.pii_detected.map((pii: any, idx: number) => (
                                                            <p key={idx} className="text-xs">
                                                                • {pii.column_name}: {pii.pii_type} ({(pii.confidence * 100).toFixed(0)}%)
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* k-Anonymity */}
                                        {results.validations.privacy.k_anonymity && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold mb-2">
                                                    k-Anonymity (k={results.validations.privacy.k_anonymity.k_value}):
                                                </h4>
                                                <Badge
                                                    variant={results.validations.privacy.k_anonymity.satisfies_k ? 'default' : 'destructive'}
                                                    className="mb-2"
                                                >
                                                    {results.validations.privacy.k_anonymity.satisfies_k ? 'PASSED' : 'FAILED'}
                                                </Badge>
                                                {!results.validations.privacy.k_anonymity.satisfies_k && (
                                                    <p className="text-xs">
                                                        Min group size: {results.validations.privacy.k_anonymity.actual_min_k}<br />
                                                        Violating groups: {results.validations.privacy.k_anonymity.violating_groups_count}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* l-Diversity */}
                                        {results.validations.privacy.l_diversity && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold mb-2">
                                                    l-Diversity (l={results.validations.privacy.l_diversity.l_value}):
                                                </h4>
                                                <Badge
                                                    variant={results.validations.privacy.l_diversity.satisfies_l ? 'default' : 'destructive'}
                                                    className="mb-2"
                                                >
                                                    {results.validations.privacy.l_diversity.satisfies_l ? 'PASSED' : 'FAILED'}
                                                </Badge>
                                                {!results.validations.privacy.l_diversity.satisfies_l && (
                                                    <p className="text-xs">
                                                        Sensitive: {results.validations.privacy.l_diversity.sensitive_attribute}<br />
                                                        Violating groups: {results.validations.privacy.l_diversity.violating_groups_count}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Overall Status */}
                                        <div className={`mt-4 p-3 rounded ${results.validations.privacy.overall_passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <p className="text-sm font-semibold">
                                                {results.validations.privacy.overall_passed ? '✓ Privacy Validated' : '⚠️ Privacy Issues Found'}
                                            </p>
                                        </div>

                                        {results.validations.privacy.mlflow_run_id && (
                                            <p className="text-xs text-muted-foreground mt-4">
                                                MLflow Run: {results.validations.privacy.mlflow_run_id.substring(0, 8)}...
                                            </p>
                                        )}

                                        <Button
                                            variant="outline"
                                            className="w-full mt-4"
                                            onClick={() => navigate(`/validations/${results.suite_id}/privacy`)}
                                        >
                                            View Detailed Privacy Report
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Accountability */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center mb-4">
                                        <ClipboardList className="h-8 w-8 text-purple-600 mr-3" />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">Accountability Tracking</h3>
                                            <Badge variant="default" className="mt-1">
                                                MLflow Integrated
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        All validations tracked in MLflow
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        View experiment runs in MLflow UI
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mt-6 flex gap-4">
                            <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>
                                Back to Project
                            </Button>
                            <Button onClick={handleReset}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Run Another Validation
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}