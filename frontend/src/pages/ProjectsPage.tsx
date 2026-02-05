import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Folder, 
    Trash2, 
    Edit3, 
    Cpu, 
    Database, 
    FileText, 
    Loader2,
    Search
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../services/api';
import type { Project } from '../types';

// shadcn UI components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function ProjectsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [createOpen, setCreateOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [error, setError] = useState('');

    const { data: projects, isLoading } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: projectsApi.list,
    });

    const createMutation = useMutation({
        mutationFn: projectsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setCreateOpen(false);
            setNewProject({ name: '', description: '' });
        },
        onError: (err: Error) => setError(err.message || 'Failed to create project'),
    });

    const deleteMutation = useMutation({
        mutationFn: projectsApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    });

    const handleCreate = () => {
        if (!newProject.name.trim()) {
            setError('Project name is required');
            return;
        }
        createMutation.mutate(newProject);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Orchestrate and monitor your AI validation workflows.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> New Project
                </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects?.map((project) => (
                    <Card 
                        key={project.id}
                        className="group relative flex flex-col overflow-hidden border-border/50 bg-card/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 cursor-pointer"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-inner group-hover:scale-110 transition-transform">
                                    <Folder className="h-5 w-5" />
                                </div>
                                <CardTitle className="line-clamp-1 group-hover:text-indigo-400 transition-colors">
                                    {project.name}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                                {project.description || 'No project description provided.'}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-background/50 font-normal">
                                    <Cpu className="mr-1 h-3 w-3 opacity-70" /> {project.model_count || 0} Models
                                </Badge>
                                <Badge variant="secondary" className="bg-background/50 font-normal">
                                    <Database className="mr-1 h-3 w-3 opacity-70" /> {project.dataset_count || 0} Sets
                                </Badge>
                                <Badge variant="secondary" className="bg-background/50 font-normal">
                                    <FileText className="mr-1 h-3 w-3 opacity-70" /> {project.requirement_count || 0} Reqs
                                </Badge>
                            </div>
                        </CardContent>

                        <CardFooter className="border-t border-border/50 bg-muted/30 py-3 flex justify-end gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-white"
                                onClick={(e) => { e.stopPropagation(); /* Edit Logic */ }}
                            >
                                <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Permanently delete this project?')) {
                                        deleteMutation.mutate(project.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {/* Empty State */}
                {(!projects || projects.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 px-4 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Folder className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">Workspace is empty</h3>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                            Kickstart your AI evaluation by creating your first project container.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={() => setCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create Project
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Project</DialogTitle>
                        <DialogDescription>
                            Define the scope of your AI validation environment.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        {error && (
                            <Alert variant="destructive" className="py-2">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input 
                                placeholder="e.g. Healthcare LLM Validation" 
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea 
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="What are the goals for this project?"
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700" 
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}