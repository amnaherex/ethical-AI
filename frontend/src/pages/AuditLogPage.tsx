import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    RefreshCw, 
    Eye, 
    Calendar, 
    Activity, 
    Clock, 
    Fingerprint,
    Loader2
} from 'lucide-react';

import { auditApi } from '../services/api';
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";

export default function AuditLogPage() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const { data: logs, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['audit', page, rowsPerPage],
        queryFn: () => auditApi.list({ skip: page * rowsPerPage, limit: rowsPerPage }),
    });

    const { data: summary } = useQuery({
        queryKey: ['audit-summary'],
        queryFn: auditApi.getSummary,
        retry: false,
        meta: { ignoreError: true }
    });

    return (
        <div className="container max-w-7xl py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
                    <p className="text-muted-foreground">Monitor system events and user actions.</p>
                </div>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => refetch()} 
                    disabled={isFetching}
                    className="rounded-full hover:rotate-180 transition-transform duration-500"
                >
                    <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                </Button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard title="Total Events" value={summary.total_events} icon={Activity} />
                    <SummaryCard title="Today" value={summary.events_today} icon={Clock} />
                    <SummaryCard title="This Week" value={summary.events_this_week} icon={Calendar} />
                    <SummaryCard title="Action Types" value={Object.keys(summary.by_action || {}).length} icon={Fingerprint} />
                </div>
            )}

            {/* Main Table Card */}
            <Card className="border-white/5 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border border-white/5">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[200px]">Date</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Resource</TableHead>
                                        <TableHead>User ID</TableHead>
                                        <TableHead className="text-right">Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs?.map((log: any) => (
                                        <TableRow key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                            <TableCell className="font-medium text-muted-foreground">
                                                {new Date(log.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize font-mono text-[10px]">
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{log.resource_type}</TableCell>
                                            <TableCell className="text-muted-foreground">{log.user_id}</TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setSelectedLog(log)}
                                                    className="hover:text-primary"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                
                {/* Custom Pagination Footer */}
                <div className="flex items-center justify-end space-x-2 p-4 border-t border-white/5">
                    <p className="text-xs text-muted-foreground mr-4">Page {page + 1}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!logs || logs.length < rowsPerPage}
                    >
                        Next
                    </Button>
                </div>
            </Card>

            {/* Details Modal */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="sm:max-w-[600px] bg-card border-white/10">
                    <DialogHeader>
                        <DialogTitle>Audit Details</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="rounded-lg bg-black/40 p-4 border border-white/5 overflow-auto max-h-[400px]">
                            <pre className="text-xs font-mono text-emerald-400">
                                {JSON.stringify(selectedLog?.details, null, 2)}
                            </pre>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setSelectedLog(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Reusable Sub-component for stats
function SummaryCard({ title, value, icon: Icon }: { title: string, value: number, icon: any }) {
    return (
        <Card className="border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-primary opacity-70" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
            </CardContent>
        </Card>
    );
}