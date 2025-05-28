
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, MapPin, User } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
