'use client';
import React, { useEffect, useState } from 'react';
import { BarChart3, Search, Filter, Download, Calendar, Users, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import moment from 'moment';
import Link from 'next/link';
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

function InterviewAnalytics() {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterAndSortInterviews();
  }, [interviews, searchTerm, sortBy, sortOrder]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      console.log('Fetching interviews...');
      
      // Test database connection first
      const { data: testData, error: testError } = await supabase
        .from('interviews')
        .select('count', { count: 'exact', head: true });

      console.log('Database connection test:', { testData, testError });

      if (testError) {
        console.error('Database connection error:', testError);
        toast.error('Database connection failed');
        setInterviews([]);
        return;
      }

      // First, try to get interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Interviews query result:', { interviewsData, interviewsError });

      if (interviewsError) {
        console.error('Error fetching interviews:', interviewsError);
        toast.error('Failed to fetch interviews');
        setInterviews([]);
        return;
      }

      // If no interviews found, set empty array
      if (!interviewsData || interviewsData.length === 0) {
        console.log('No interviews found in database');
        setInterviews([]);
        return;
      }

      console.log(`Found ${interviewsData.length} interviews`);
      console.log(interviewsData[0]);

      // Get candidate counts and results for each interview
      const interviewsWithStats = await Promise.all(
        interviewsData.map(async (interview) => {
          try {
            const { data: results, error: resultsError } = await supabase
              .from('interview_results')
              .select('*')
              .eq('interview_id', interview.interview_id);

            console.log('Results for interview', interview.interview_id, results);

            if (resultsError) {
              console.error('Error fetching results for interview:', interview.interview_id, resultsError);
              // Return interview with empty stats if results fetch fails
              return {
                ...interview,
                candidateCount: 0,
                completedCount: 0,
                totalDuration: 0,
                avgScore: 0
              };
            }

            const resultsData = results || [];
            const completedResults = resultsData.filter(r => r.status === 'completed');
            const totalDuration = completedResults.reduce((sum, r) => sum + (r.duration || 0), 0);
            const avgScore = completedResults.length > 0 
              ? completedResults.reduce((sum, r) => sum + (r.score || 0), 0) / completedResults.length 
              : 0;

            return {
              ...interview,
              candidateCount: resultsData.length,
              completedCount: completedResults.length,
              totalDuration,
              avgScore: Math.round(avgScore * 100) / 100
            };
          } catch (error) {
            console.error('Error processing interview:', interview.id, error);
            // Return interview with empty stats if processing fails
            return {
              ...interview,
              candidateCount: 0,
              completedCount: 0,
              totalDuration: 0,
              avgScore: 0
            };
          }
        })
      );

      setInterviews(interviewsWithStats);
    } catch (error) {
      console.error('Error in fetchInterviews:', error);
      toast.error('Failed to fetch interviews');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortInterviews = () => {
    let filtered = interviews.filter(interview => {
      const title = interview.title || interview.name || 'Untitled Interview';
      const useremail = interview.useremail || interview.email || '';
      
      return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        useremail.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Sort interviews
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

    setFilteredInterviews(filtered);
  };

  const exportInterviewsToCSV = () => {
    const csvContent = [
      ['Title', 'Creator', 'Created Date', 'Candidates', 'Completed', 'Avg Score', 'Total Duration (min)', 'Status'],
      ...filteredInterviews.map(interview => [
        interview.title || interview.name || 'N/A',
        interview.useremail || interview.email || 'N/A',
        moment(interview.created_at).format('YYYY-MM-DD HH:mm'),
        interview.candidateCount,
        interview.completedCount,
        interview.avgScore,
        Math.round(interview.totalDuration / 60),
        interview.candidateCount > 0 ? 'Active' : 'No Candidates'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviews-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Interviews exported successfully');
  };

  const getStatusColor = (interview) => {
    if (interview.completedCount > 0) return 'text-green-600 bg-green-50';
    if (interview.candidateCount > 0) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusText = (interview) => {
    if (interview.completedCount > 0) return 'Completed';
    if (interview.candidateCount > 0) return 'In Progress';
    return 'No Candidates';
  };

  const getCompletionRate = (interview) => {
    if (interview.candidateCount === 0) return 0;
    return Math.round((interview.completedCount / interview.candidateCount) * 100);
  };

  const handleDeleteInterview = async (interview) => {
    setDeletingId(interview.interview_id);
    setShowDeleteAlert(true);
  };

  const confirmDeleteInterview = async () => {
    const interview = filteredInterviews.find(i => i.interview_id === deletingId);
    if (!interview) return;
    try {
      // Delete interview results first
      const { error: resultsError } = await supabase
        .from('interview_results')
        .delete()
        .eq('interview_id', interview.interview_id);
      if (resultsError) {
        toast.error('Failed to delete interview results');
        setShowDeleteAlert(false);
        setDeletingId(null);
        return;
      }
      // Delete the interview
      const { error: interviewError } = await supabase
        .from('interviews')
        .delete()
        .eq('interview_id', interview.interview_id);
      if (interviewError) {
        toast.error('Failed to delete interview');
      } else {
        toast.success('Interview deleted successfully');
        fetchInterviews();
      }
    } catch (e) {
      toast.error('Error deleting interview');
    } finally {
      setShowDeleteAlert(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Analytics</h1>
          <p className="text-gray-600 mt-1">Monitor interview performance and candidate results</p>
        </div>
        <Button onClick={exportInterviewsToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.length}</div>
            <p className="text-xs text-muted-foreground">
              Created interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.reduce((sum, interview) => sum + interview.candidateCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Interview participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Interviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.reduce((sum, interview) => sum + interview.completedCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Finished interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.length > 0 
                ? Math.round(interviews.reduce((sum, interview) => sum + interview.avgScore, 0) / interviews.length * 100) / 100
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Interviews</CardTitle>
          <CardDescription>
            Find specific interviews or filter by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by title or creator email..."
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
                <option value="title">Title</option>
                <option value="candidateCount">Candidates</option>
                <option value="avgScore">Score</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Interviews ({filteredInterviews.length})</CardTitle>
          <CardDescription>
            Complete list of interviews with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => (
                <div key={interview.interview_id} className="relative">
                  <Link
                    href={`/admin/interviews/${interview.interview_id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {interview.title || interview.name || interview.jobposition || interview.jobdescription || 'Untitled Interview'}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {interview.useremail || interview.email || 'Unknown'}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {moment(interview.created_at).format('MMM DD, YYYY')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {interview.candidateCount} candidates
                          </div>
                          <div className="text-xs text-gray-500">
                            {interview.completedCount} completed
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {interview.avgScore} avg score
                          </div>
                          <div className="text-xs text-gray-500">
                            {getCompletionRate(interview)}% completion
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {Math.round(interview.totalDuration / 60)} min
                          </div>
                          <div className="text-xs text-gray-500">total time</div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(interview)}`}>
                            {getStatusText(interview)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteInterview(interview)}
                    title="Delete Interview"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {filteredInterviews.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No interviews found matching your criteria</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview and all its results? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteInterview} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InterviewAnalytics; 