
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

function UserTable({ role }: { role: 'patient' | 'doctor' }) {
    const firestore = useFirestore();
    const usersQuery = useMemoFirebase(() => 
        firestore ? query(collection(firestore, 'users')) : null, // A real app would filter by role
        [firestore]
    );

    const { data: users, isLoading } = useCollection(usersQuery);

    const filteredUsers = users?.filter(u => u.role === role) || [];

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin" /></div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                            </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={user.licenseStatus === 'approved' || role === 'patient' ? 'secondary' : 'outline'}>
                                {role === 'patient' ? 'Active' : user.licenseStatus}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


export default function AdminUsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>User Management</DashboardHeaderTitle>
      </DashboardHeader>
      <DashboardContent>
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage all registered patients and providers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patients">
              <TabsList>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="providers">Providers</TabsTrigger>
              </TabsList>
              <TabsContent value="patients">
                <UserTable role="patient" />
              </TabsContent>
              <TabsContent value="providers">
                <UserTable role="doctor" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DashboardContent>
    </DashboardShell>
  );
}
