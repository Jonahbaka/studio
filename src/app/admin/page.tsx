
'use client';

import {
  DashboardShell,
  DashboardHeader,
  DashboardHeaderTitle,
  DashboardContent,
} from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, Activity, Stethoscope, User, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  BarChart,
  Bar,
} from "recharts";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useMemo } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserData {
  id: string;
  role: 'patient' | 'doctor' | 'nurse';
  createdAt?: { toDate: () => Date };
  firstName?: string;
  lastName?: string;
  email?: string;
  licenseStatus?: string;
}

const processChartData = (users: UserData[] | null) => {
    if (!users) return [];
    
    const monthlyData: { [key: string]: { users: number, revenue: number } } = {};

    users.forEach(user => {
        if (user.createdAt) {
            const date = user.createdAt.toDate();
            const month = format(date, 'MMM');
            if (!monthlyData[month]) {
                monthlyData[month] = { users: 0, revenue: 0 };
            }
            monthlyData[month].users++;
            // Assuming $25 for each new user for mock revenue
            if (user.role === 'patient') {
              monthlyData[month].revenue += 25;
            }
        }
    });

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return monthOrder.map(month => ({
        name: month,
        users: monthlyData[month]?.users || 0,
        revenue: monthlyData[month]?.revenue || 0,
    })).filter(d => d.users > 0 || d.revenue > 0);
};

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: users, isLoading } = useCollection<UserData>(usersQuery);

  const stats = useMemo(() => {
    if (!users) return { total: 0, patients: 0, providers: 0 };
    return {
      total: users.length,
      patients: users.filter(u => u.role === 'patient').length,
      providers: users.filter(u => ['doctor', 'nurse'].includes(u.role)).length,
    };
  }, [users]);
  
  const recentProviders = useMemo(() => {
    if (!users) return [];
    return users.filter(u => ['doctor', 'nurse'].includes(u.role)).slice(0, 5);
  }, [users]);

  const chartData = useMemo(() => processChartData(users), [users]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader>
        <DashboardHeaderTitle>Admin Dashboard</DashboardHeaderTitle>
      </DashboardHeader>
      <DashboardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.patients}</div>
              <p className="text-xs text-muted-foreground">{((stats.patients / stats.total) * 100 || 0).toFixed(1)}% of total users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Providers</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.providers}</div>
              <p className="text-xs text-muted-foreground">{((stats.providers / stats.total) * 100 || 0).toFixed(1)}% of total users</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>New User Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue (Simulated)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="hsl(var(--accent))" name="Revenue ($)" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
         <Card>
          <CardHeader>
            <CardTitle>Recent Providers</CardTitle>
            <CardDescription>The latest providers who have joined the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead>License Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProviders.length > 0 ? recentProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{provider.firstName?.[0]}{provider.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{provider.firstName} {provider.lastName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{provider.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {provider.createdAt ? format(provider.createdAt.toDate(), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell>
                        <Badge variant={provider.licenseStatus === 'approved' ? 'secondary' : 'outline'}>
                            {provider.licenseStatus}
                        </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No providers have signed up yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DashboardContent>
    </DashboardShell>
  );
}
