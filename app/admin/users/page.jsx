'use client';
import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, Download, Eye, Mail, Calendar, UserCheck, Trash2, Ban, AlertTriangle } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import moment from 'moment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@/app/provider';

function UserManagement() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showBanned, setShowBanned] = useState(true);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, sortBy, sortOrder, showBanned]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get interview counts for each user
      const usersWithStats = await Promise.all(
        data.map(async (user) => {
          const { count: interviewCount } = await supabase
            .from('interviews')
            .select('*', { count: 'exact', head: true })
            .eq('useremail', user.email);

          const { count: candidateCount } = await supabase
            .from('interview_results')
            .select('*', { count: 'exact', head: true })
            .eq('interview_id', user.interview_id);

          return {
            ...user,
            interviewCount: interviewCount || 0,
            candidateCount: candidateCount || 0
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter(user => {
      // Filter by search term
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by banned status
      const matchesBannedFilter = showBanned || !user.banned;
      
      return matchesSearch && matchesBannedFilter;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const exportUsersToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Created Date', 'Interviews Created', 'Candidates Interviewed', 'Credits', 'Status'],
      ...filteredUsers.map(user => [
        user.name || 'N/A',
        user.email || 'N/A',
        moment(user.created_at).format('YYYY-MM-DD HH:mm'),
        user.interviewCount,
        user.candidateCount,
        user.credits || 0,
        getStatusText(user)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  const getStatusText = (user) => {
    if (user.banned) return 'Banned';
    if (user.interviewCount > 0) return 'Active';
    if (user.created_at) return 'Registered';
    return 'Inactive';
  };

  const getStatusColor = (user) => {
    if (user.banned) return 'text-red-600 bg-red-50';
    if (user.interviewCount > 0) return 'text-green-600 bg-green-50';
    if (user.created_at) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const deleteUser = async (userId) => {
    try {
      // First, delete all related data
      const { error: interviewsError } = await supabase
        .from('Interviews')
        .delete()
        .eq('useremail', users.find(u => u.id === userId)?.email);

      if (interviewsError) {
        console.error('Error deleting interviews:', interviewsError);
      }

      const { error: resultsError } = await supabase
        .from('interview_results')
        .delete()
        .eq('interview_id', users.find(u => u.id === userId)?.interview_id);

      if (resultsError) {
        console.error('Error deleting interview results:', resultsError);
      }

      // Finally, delete the user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Debug function to test ban functionality
  const testBanFunction = async (userId) => {
    try {
      console.log('Testing ban function for user ID:', userId);
      
      // Test direct Supabase update
      const { data, error } = await supabase
        .from('users')
        .update({ banned: true })
        .eq('id', userId)
        .select();

      console.log('Direct Supabase result:', { data, error });
      
      if (error) {
        console.error('Direct update failed:', error);
        
        // Try to get user details
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        console.log('User data:', userData);
        console.log('Fetch error:', fetchError);
      }
    } catch (error) {
      console.error('Test function error:', error);
    }
  };

  const banUser = async (userId, banStatus) => {
    try {
      console.log('Attempting to ban user:', { userId, banStatus });
      
      // Use the API route for better error handling and admin privileges
      const response = await fetch('/api/admin/ban-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, banStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Ban API error:', result);
        toast.error(result.error || 'Failed to update user status');
        return;
      }

      console.log('Ban API success:', result);
      toast.success(result.message);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user ban status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Add Admin Handler
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!adminEmail.includes('@admin') && !adminEmail.includes('@superadmin')) {
      toast.error('Admin email must contain @admin or @superadmin');
      return;
    }
    setAddingAdmin(true);
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            name: adminName,
            role: 'admin',
          },
        },
      });
      if (authError) {
        if (authError.message && authError.message.includes('User already registered')) {
          toast.error('This email is already registered in Auth.');
        } else {
          toast.error(authError?.message || 'Failed to create admin in Auth.');
        }
        setAddingAdmin(false);
        return;
      }
      // 2. Insert into users table (ignore duplicate error)
      const { error: insertError } = await supabase.from('users').insert([
        {
          email: adminEmail,
          name: adminName,
          role: 'admin',
          picture: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          credits: 0,
        },
      ]);
      if (insertError && insertError.code !== '23505') { // 23505 = unique_violation
        console.error('Insert error:', insertError);
        alert(JSON.stringify(insertError, null, 2));
        toast.error('Failed to add admin to users table.');
        setAddingAdmin(false);
        return;
      }
      toast.success('Admin added successfully!');
      setShowAddAdmin(false);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      fetchUsers();
    } catch (err) {
      toast.error('Unexpected error occurred.');
    } finally {
      setAddingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all registered users</p>
        </div>
        <div className="flex gap-2">
          {user?.email?.includes('@superadmin') && (
            <Button onClick={() => setShowAddAdmin(true)} className="bg-blue-600 text-white">
              + Add Admin
            </Button>
          )}
          <Button onClick={exportUsersToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Add Admin Modal (only for superadmin) */}
      {user?.email?.includes('@superadmin') && (
        <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={adminName} onChange={e => setAdminName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Email</label>
                <Input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required placeholder="admin@admin.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required minLength={8} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addingAdmin} className="bg-blue-600 text-white w-full">
                  {addingAdmin ? 'Adding...' : 'Add Admin'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.interviewCount > 0 && !u.banned).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Created interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.banned).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Suspended accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + user.interviewCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Created across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + user.candidateCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Interviewed candidates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Users</CardTitle>
          <CardDescription>
            Find specific users or filter by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="created_at">Created Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="interviewCount">Interviews</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant={showBanned ? "default" : "outline"}
                onClick={() => setShowBanned(!showBanned)}
                className={showBanned ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <Ban className="w-4 h-4 mr-1" />
                {showBanned ? 'Hide Banned' : 'Show Banned'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Complete list of registered users and their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
                         <div className="space-y-4">
               {filteredUsers.map((user) => (
                 <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                   <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                       <span className="text-sm font-medium text-blue-600">
                         {user.name?.charAt(0)?.toUpperCase() || 'U'}
                       </span>
                     </div>
                     <div>
                       <h3 className="font-medium text-gray-900">
                         {user.name || 'Unnamed User'}
                       </h3>
                       <div className="flex items-center space-x-4 text-sm text-gray-500">
                         <span className="flex items-center">
                           <Mail className="w-3 h-3 mr-1" />
                           {user.email}
                         </span>
                         <span className="flex items-center">
                           <Calendar className="w-3 h-3 mr-1" />
                           {moment(user.created_at).format('MMM DD, YYYY')}
                         </span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex items-center space-x-6">
                     <div className="text-right">
                       <div className="text-sm font-medium text-gray-900">
                         {user.interviewCount} interviews
                       </div>
                       <div className="text-xs text-gray-500">
                         {user.candidateCount} candidates
                       </div>
                     </div>
                     
                     <div className="text-right">
                       <div className="text-sm font-medium text-gray-900">
                         {user.credits || 0} credits
                       </div>
                       <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(user)}`}>
                         {getStatusText(user)}
                       </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex items-center space-x-2">
                       {/* Debug Button (temporary) */}
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => testBanFunction(user.id)}
                         className="text-blue-600 hover:text-blue-700"
                       >
                         Debug
                       </Button>
                       
                       {/* Ban/Unban Button */}
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button
                             variant="outline"
                             size="sm"
                             className={user.banned ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                           >
                             {user.banned ? (
                               <>
                                 <UserCheck className="w-3 h-3 mr-1" />
                                 Unban
                               </>
                             ) : (
                               <>
                                 <Ban className="w-3 h-3 mr-1" />
                                 Ban
                               </>
                             )}
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>
                               {user.banned ? 'Unban User' : 'Ban User'}
                             </AlertDialogTitle>
                             <AlertDialogDescription>
                               {user.banned 
                                 ? `Are you sure you want to unban ${user.name || user.email}? They will be able to access the platform again.`
                                 : `Are you sure you want to ban ${user.name || user.email}? They will lose access to the platform.`
                               }
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                               onClick={() => banUser(user.id, !user.banned)}
                               className={user.banned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                             >
                               {user.banned ? 'Unban User' : 'Ban User'}
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>

                       {/* Delete Button */}
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button
                             variant="outline"
                             size="sm"
                             className="text-red-600 hover:text-red-700 hover:bg-red-50"
                           >
                             <Trash2 className="w-3 h-3 mr-1" />
                             Delete
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle className="flex items-center gap-2">
                               <AlertTriangle className="w-5 h-5 text-red-600" />
                               Delete User
                             </AlertDialogTitle>
                             <AlertDialogDescription>
                               This action cannot be undone. This will permanently delete{' '}
                               <strong>{user.name || user.email}</strong> and all their data including:
                               <ul className="list-disc list-inside mt-2 space-y-1">
                                 <li>All created interviews</li>
                                 <li>All interview results</li>
                                 <li>User account and settings</li>
                               </ul>
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                               onClick={() => deleteUser(user.id)}
                               className="bg-red-600 hover:bg-red-700"
                             >
                               Delete User
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>
                   </div>
                 </div>
               ))}
              
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No users found matching your criteria</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserManagement; 