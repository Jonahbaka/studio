
'use client';

import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
} from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for Gold members. In a real app, this would come from a 'payments' collection in Firestore.
const goldMembers = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', amount: 25, status: 'Paid', date: '2024-06-15' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', amount: 25, status: 'Paid', date: '2024-06-14' },
    { id: '3', name: 'Chioma Okoro', email: 'chioma.okoro@example.com', amount: 25, status: 'Paid', date: '2024-06-12' },
    { id: '4', name: 'Liam Johnson', email: 'liam.j@example.com', amount: 25, status: 'Paid', date: '2024-06-10' },
];

export default function AdminBillingPage() {
  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>Billing Overview</DashboardHeaderTitle>
      </DashboardHeader>
      <DashboardContent>
        <Card>
            <CardHeader>
                <CardTitle>Gold Memberships</CardTitle>
                <CardDescription>Recent payments for Zuma Gold memberships.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {goldMembers.map(member => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-sm text-muted-foreground">{member.email}</div>
                                </TableCell>
                                <TableCell>${member.amount}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{member.status}</Badge>
                                </TableCell>
                                <TableCell>{member.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </DashboardContent>
    </DashboardShell>
  );
}
