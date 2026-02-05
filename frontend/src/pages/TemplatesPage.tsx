import { useState } from 'react';
import { Plus, Trash2, ChevronDown, Shield, Layout, ListChecks } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../services/api';

// shadcn UI components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion";

export default function TemplatesPage() {
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        description: '',
        principle: 'fairness',
        category: '',
        rules: [{ metric: '', operator: '>=', value: 0.8, description: '' }],
    });

    const { data: templates, isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: templatesApi.list,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: templatesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setCreateOpen(false);
            setNewTemplate({
                name: '',
                description: '',
                principle: 'fairness',
                category: '',
                rules: [{ metric: '', operator: '>=', value: 0.8, description: '' }],
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: templatesApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
    });

    // Rule Helpers
    const addRule = () => {
        setNewTemplate(prev => ({
            ...prev,
            rules: [...prev.rules, { metric: '', operator: '>=', value: 0.8, description: '' }]
        }));
    };

    const updateRule = (index: number, field: string, value: string | number) => {
        const updated = [...newTemplate.rules];
        updated[index] = { ...updated[index], [field]: value };
        setNewTemplate({ ...newTemplate, rules: updated });
    };

    const removeRule = (index: number) => {
        setNewTemplate(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500" />
        </div>
    );

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Evaluation Templates</h1>
                    <p className="text-muted-foreground mt-1">Define ethical guardrails and performance metrics for your AI models.</p>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                            <Plus className="mr-2 h-4 w-4" /> New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-[#1a1a2e] border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Create Custom Template</DialogTitle>
                        </DialogHeader>
                        
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input 
                                        className="bg-black/20 border-white/10"
                                        value={newTemplate.name} 
                                        onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Principle</Label>
                                    <Select 
                                        value={newTemplate.principle} 
                                        onValueChange={v => setNewTemplate({...newTemplate, principle: v})}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fairness">Fairness</SelectItem>
                                            <SelectItem value="transparency">Transparency</SelectItem>
                                            <SelectItem value="privacy">Privacy</SelectItem>
                                            <SelectItem value="accountability">Accountability</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    className="bg-black/20 border-white/10"
                                    value={newTemplate.description}
                                    onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-indigo-400 flex items-center gap-2">
                                        <ListChecks className="h-4 w-4" /> Policy Rules
                                    </Label>
                                    <Button variant="outline" size="sm" onClick={addRule} className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                                        Add Rule
                                    </Button>
                                </div>
                                
                                {newTemplate.rules.map((rule, idx) => (
                                    <div key={idx} className="flex gap-2 items-start bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="flex-1 space-y-2">
                                            <Input 
                                                placeholder="Metric (e.g. Disparate Impact)" 
                                                className="h-8 text-xs" 
                                                value={rule.metric}
                                                onChange={e => updateRule(idx, 'metric', e.target.value)}
                                            />
                                        </div>
                                        <Select value={rule.operator} onValueChange={v => updateRule(idx, 'operator', v)}>
                                            <SelectTrigger className="w-[80px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value=">=">&ge;</SelectItem>
                                                <SelectItem value="<=">&le;</SelectItem>
                                                <SelectItem value="==">=</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input 
                                            type="number" 
                                            className="w-[80px] h-8 text-xs" 
                                            value={rule.value}
                                            onChange={e => updateRule(idx, 'value', parseFloat(e.target.value))}
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => removeRule(idx)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button 
                                className="bg-indigo-600 hover:bg-indigo-700" 
                                onClick={() => createMutation.mutate(newTemplate)}
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? "Creating..." : "Save Template"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates?.map((template: any) => (
                    <Card key={template.id} className="group border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge className={`${getPrincipleColor(template.principle)} border-none capitalize`}>
                                    {template.principle}
                                </Badge>
                                {template.is_system && (
                                    <Badge variant="outline" className="border-white/20 text-white/60">System</Badge>
                                )}
                            </div>
                            <CardTitle className="text-xl text-indigo-100">{template.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="rules" className="border-white/10">
                                    <AccordionTrigger className="text-sm text-white/70 hover:no-underline">
                                        View {template.rules?.length || 0} Rule Configuration
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-2">
                                        {template.rules?.map((rule: any, i: number) => (
                                            <div key={i} className="p-2 rounded bg-black/20 border border-white/5">
                                                <p className="text-xs font-semibold text-indigo-300">{rule.metric}</p>
                                                <p className="text-[11px] text-white/50">
                                                    Target: <span className="text-white">{rule.operator} {rule.value}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {!template.is_system && (
                                <div className="flex justify-end pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                        onClick={() => deleteMutation.mutate(template.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Utility to match principle to colors
function getPrincipleColor(principle: string) {
    const colors: Record<string, string> = {
        fairness: "bg-emerald-500/20 text-emerald-400",
        transparency: "bg-blue-500/20 text-blue-400",
        privacy: "bg-purple-500/20 text-purple-400",
        accountability: "bg-amber-500/20 text-amber-400"
    };
    return colors[principle.toLowerCase()] || "bg-indigo-500/20 text-indigo-400";
}