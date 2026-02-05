import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderRoot,
    ClipboardCheck,
    FileText,
    History,
    Settings,
    LogOut,
    User,
    ShieldCheck,
    Menu as MenuIcon
} from "lucide-react";

import { cn } from "../lib/utils";
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarRail,
} from "../components/ui/sidebar";

const menuItems = [
    { text: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { text: 'Projects', icon: FolderRoot, path: '/projects' },
    { text: 'Validations', icon: ClipboardCheck, path: '/validations' },
    { text: 'Templates', icon: FileText, path: '/templates' },
    { text: 'Audit Log', icon: History, path: '/audit' },
];

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                {/* --- SIDEBAR --- */}
                <Sidebar collapsible="icon" className="border-r border-white/5">
                    <SidebarHeader className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-glow">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex flex-col overflow-hidden transition-all data-[collapsible=icon]:w-0">
                                <span className="text-sm font-bold leading-none tracking-tight">Ethical AI</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Platform</span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="px-2 mt-4">
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <SidebarMenuItem key={item.text}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.text}
                                            className={cn(
                                                "transition-all duration-200 h-11",
                                                isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : "hover:bg-white/5"
                                            )}
                                        >
                                            <Link to={item.path} className="flex items-center gap-3">
                                                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                                <span className="font-medium">{item.text}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter className="p-4 border-t border-white/5">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 overflow-hidden">
                                    <Avatar className="h-9 w-9 border border-white/10">
                                        <AvatarFallback className="bg-primary text-[10px] text-white">
                                            {user?.name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold truncate">{user?.name || 'User'}</span>
                                        <span className="text-[10px] text-muted-foreground capitalize">{user?.role || 'user'}</span>
                                    </div>
                                </div>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>

                {/* --- MAIN PAGE AREA --- */}
                <div className="flex flex-1 flex-col">
                    {/* Header/Nav Bar */}
                    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md px-6 sticky top-0 z-10">
                        <SidebarTrigger className="hover:bg-white/5" />
                        
                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9 border border-white/10 hover:border-primary/50 transition-colors">
                                            <AvatarFallback className="bg-secondary text-xs">
                                                {user?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Content Viewport */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-7xl animate-fade-in">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}