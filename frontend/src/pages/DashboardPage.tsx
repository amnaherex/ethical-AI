import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    Plus, 
    Folder, 
    BarChart3, 
    CheckCircle2, 
    AlertCircle, 
    TrendingUp, 
    Clock, 
    ShieldCheck, 
    Scale, 
    Search,
    Loader2
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { projectsApi } from '../services/api';
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, colorClass, trend }: any) => (
    <Card className="overflow-hidden border-white/5 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                    {trend && (
                        <div className="flex items-center gap-1 text-xs text-emerald-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
                <div className={cn("rounded-xl p-3 bg-opacity-10", colorClass)}>
                    <Icon className="h-5 w-5 opacity-80" />
                </div>
            </div>
        </CardContent>
    </Card>
);

// Reusable Project Row Component
const ProjectItem = ({ project, onClick }: any) => (
    <Card 
        className="group cursor-pointer border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
        onClick={onClick}
    >
        <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <Folder className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-lg">{project.name}</h4>
                </div>
                <Badge 
                    variant={project.status === 'Ready' ? 'default' : 'secondary'}
                    className={cn(
                        project.status === 'Ready' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        project.status === 'In Progress' && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}
                >
                    {project.status}
                </Badge>
            </div>

            <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="text-[10px] font-mono font-normal">
                    {project.modelCount} Models
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono font-normal">
                    {project.datasetCount} Datasets
                </Badge>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Setup Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.3" />
                <span>Updated {project.lastUpdated}</span>
            </div>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.list(),
    });

    const stats = useMemo(() => {
        if (!projects) return [];
        const m = projects.reduce((acc: any, p: any) => acc + (p.model_count || 0), 0);
        const d = projects.reduce((acc: any, p: any) => acc + (p.dataset_count || 0), 0);

        return [
            { title: 'Total Projects', value: projects.length, icon: Folder, colorClass: "bg-blue-500 text-blue-500", trend: "+12% from last month" },
            { title: 'Models & Datasets', value: m + d, icon: BarChart3, colorClass: "bg-purple-500 text-purple-500" },
            { title: 'Active Projects', value: projects.length, icon: CheckCircle2, colorClass: "bg-emerald-500 text-emerald-500" },
            { title: 'System Health', value: '98%', icon: ShieldCheck, colorClass: "bg-amber-500 text-amber-500" },
        ];
    }, [projects]);

    if (isLoading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="container max-w-7xl py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Your AI validation overview for today.</p>
                </div>
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" onClick={() => navigate('/projects')}>
                    <Plus className="h-5 w-5" /> New Project
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
            </div>

            <div className="grid gap-8 md:grid-cols-12">
                {/* Recent Projects List */}
                <div className="md:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Recent Projects</h2>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>View All</Button>
                    </div>

                    <div className="grid gap-4">
                        {projects?.slice(0, 3).map((p: any) => (
                            <ProjectItem 
                                key={p.id} 
                                project={{...p, modelCount: p.model_count || 0, datasetCount: p.dataset_count || 0, progress: 75, lastUpdated: '2h ago'}} 
                                onClick={() => navigate(`/projects/${p.id}`)} 
                            />
                        ))}
                    </div>
                </div>

                {/* Sidebar Actions & Principles */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="bg-primary/5 border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button variant="secondary" className="justify-start gap-2 w-full" >
                                <Plus className="h-4 w-4" /> Upload Model
                            </Button>
                            <Button variant="secondary" className="justify-start gap-2 w-full" >
                                <BarChart3 className="h-4 w-4" /> Run Validation
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm">Ethical AI Framework</CardTitle>
                            <CardDescription>Core principles of our validation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Principle icon={Scale} name="Fairness" desc="Bias detection & mitigation" />
                            <Principle icon={Search} name="Explainability" desc="Decision path transparency" />
                            <Principle icon={ShieldCheck} name="Safety" desc="Adversarial robustness" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Principle({ icon: Icon, name, desc }: any) {
    return (
        <div className="flex gap-3">
            <div className="mt-1"><Icon className="h-4 w-4 text-primary" /></div>
            <div>
                <p className="text-sm font-semibold leading-none">{name}</p>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
        </div>
    );
}