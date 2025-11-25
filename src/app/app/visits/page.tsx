
'use client';

import Link from "next/link";
import { useMemo } from "react";
import { useUser } from "@/appwrite/hooks/useUser";
import { useDocuments } from "@/appwrite/hooks/useDocuments";
import { Query } from "appwrite";
import { COLLECTION_IDS } from "@/appwrite/config";
import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
  DashboardHeaderActions,
} from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Video, PlusCircle, CalendarPlus, Sparkles } from "lucide-react";

export default function MyVisitsPage() {
  const { user, isUserLoading } = useUser();

  const queries = useMemo(() => {
    if (!user) return [];
    return [
      Query.equal(`participants.${user.uid}`, true),
      Query.orderDesc('createdAt')
    ];
  }, [user]);

  const { data: visits, isLoading: areVisitsLoading, error } = useDocuments(COLLECTION_IDS.VISITS, queries);
  
  // The component is loading if the user is still authenticating OR if the visits are being fetched.
  const isLoading = isUserLoading || (user && areVisitsLoading);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Waiting':
        return 'outline';
      case 'In Progress':
      case 'AI In Progress':
        return 'default';
      case 'Completed':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  const EmptyState = () => (
    <div className="text-center py-16">
        <CalendarPlus className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Visits Found</h3>
        <p className="mt-2 text-sm text-muted-foreground">You haven't booked any visits yet. Get started by booking a consultation.</p>
        <Button asChild className="mt-6">
            <Link href="/app/book-visit"><PlusCircle className="mr-2 h-4 w-4" />Book Your First Visit</Link>
        </Button>
    </div>
  );

  const Content = () => {
    if (isLoading) {
      return (
        <div className="h-48 flex items-center justify-center">
            <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (error) {
        return (
            <div className="h-48 flex items-center justify-center text-destructive">
                Error loading visits: {error.message}
            </div>
        );
    }

    if (visits && visits.length > 0) {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visits.map((visit: any) => {
                      const isAiVisit = visit.status === 'AI In Progress';
                      const isHumanVisit = visit.status === 'Waiting' || visit.status === 'In Progress';
                      const visitDate = visit.createdAt ? (typeof visit.createdAt === 'string' ? new Date(visit.createdAt) : new Date()) : null;
                      return (
                        <TableRow key={visit.$id || visit.id}>
                            <TableCell>
                                {visitDate ? format(visitDate, "MMM d, yyyy 'at' h:mm a") : 'N/A'}
                            </TableCell>
                            <TableCell>{visit.reason}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(visit.status)}>{visit.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {isHumanVisit && (
                                     <Button asChild size="sm">
                                        <Link href={`/app/visit/${user?.uid}/${visit.id}`}>
                                            <Video className="mr-2 h-4 w-4"/>
                                            Join Visit
                                        </Link>
                                    </Button>
                                )}
                                {isAiVisit && (
                                      <Button asChild size="sm">
                                        <Link href={`/app/visit/ai/${visit.id}`}>
                                            <Sparkles className="mr-2 h-4 w-4"/>
                                            Continue AI Chat
                                        </Link>
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
            </Table>
        );
    }

    return <EmptyState />;
  };

  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>My Visits</DashboardHeaderTitle>
         <DashboardHeaderActions>
            <Button asChild>
              <Link href="/app/book-visit">Book New Visit</Link>
            </Button>
        </DashboardHeaderActions>
      </DashboardHeader>
      <DashboardContent>
        <Card>
            <CardHeader>
                <CardTitle>Visit History</CardTitle>
                <CardDescription>A list of your past and upcoming virtual consultations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Content />
            </CardContent>
        </Card>
      </DashboardContent>
    </DashboardShell>
  );
}
