
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Search, Calendar, MapPin, User, Clock, FileText } from 'lucide-react';

interface Complaint {
  complaint_id: string;
  status: string;
  complaint_type: string;
  description: string;
  location: string;
  created_at: string;
  user_name: string;
}

const ComplaintTracker = () => {
  const [trackingId, setTrackingId] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUserComplaints, setIsLoadingUserComplaints] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load user's recent complaints when component mounts
  useEffect(() => {
    if (user) {
      fetchUserComplaints();
    }
  }, [user]);

  const fetchUserComplaints = async () => {
    if (!user) return;
    
    setIsLoadingUserComplaints(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setUserComplaints(data || []);
    } catch (error: any) {
      console.error('Error fetching user complaints:', error);
      toast({
        title: "Error loading your complaints",
        description: "Failed to load your recent complaints",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUserComplaints(false);
    }
  };

  const handleTrackComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('complaint_id', trackingId.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Complaint not found",
            description: "No complaint found with this tracking ID.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        setComplaint(null);
        return;
      }

      setComplaint(data);
      toast({
        title: "Complaint found!",
        description: "Here are the details of your complaint.",
      });

    } catch (error: any) {
      toast({
        title: "Error tracking complaint",
        description: error.message,
        variant: "destructive"
      });
      setComplaint(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Track Your Complaint
          </CardTitle>
          <CardDescription>Enter your complaint tracking ID to check status</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackComplaint} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter complaint tracking ID (e.g., MZF2024001xxxxx)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Searching..." : "Track"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* User's Recent Complaints */}
      {user && (
        <Card className="shadow-lg border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              Your Recent Complaints
            </CardTitle>
            <CardDescription>
              Your last 5 submitted complaints and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUserComplaints ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : userComplaints.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No complaints submitted yet</p>
                <p className="text-gray-400">Submit your first complaint to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userComplaints.map((userComplaint) => (
                  <div key={userComplaint.complaint_id} className="border border-green-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-lg">#{userComplaint.complaint_id}</h3>
                          <Badge className={`ml-2 ${getStatusColor(userComplaint.status)} border`}>
                            {userComplaint.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-600 font-medium">{userComplaint.complaint_type}</p>
                        <p className="text-gray-600 text-sm mb-2">{userComplaint.description}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(userComplaint.created_at).toLocaleDateString()}
                          </div>
                          {userComplaint.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {userComplaint.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTrackingId(userComplaint.complaint_id);
                          setComplaint(userComplaint);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tracked Complaint Details */}
      {complaint && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Complaint Details</span>
              <Badge className={`${getStatusColor(complaint.status)} border`}>
                {complaint.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>Tracking ID: {complaint.complaint_id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">Submitted by:</span>
                  <span className="ml-1">{complaint.user_name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-1">{new Date(complaint.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="font-medium">Location:</span>
                  <span className="ml-1">{complaint.location || 'Not specified'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <p className="text-sm text-gray-600">{complaint.complaint_type}</p>
                </div>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Description:</span>
              <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-md">
                {complaint.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplaintTracker;
