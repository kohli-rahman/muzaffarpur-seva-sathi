
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { AlertCircle, Send } from 'lucide-react';

const ComplaintForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    complaintType: '',
    description: '',
    location: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user profile for additional details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const complaintData = {
        user_id: user.id,
        user_name: profile?.full_name || 'Unknown User',
        user_email: user.email || '',
        user_phone: profile?.phone || '',
        complaint_type: formData.complaintType,
        description: formData.description,
        location: formData.location || null
      };

      const { data, error } = await supabase
        .from('complaints')
        .insert(complaintData)
        .select()
        .single();

      if (error) throw error;

      // Send email notification to admin
      try {
        await supabase.functions.invoke('send-complaint-notification', {
          body: {
            complaint: data,
            userDetails: {
              name: profile?.full_name || 'Unknown User',
              email: user.email,
              phone: profile?.phone || 'Not provided'
            }
          }
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
      }

      toast({
        title: "Complaint submitted successfully!",
        description: `Your complaint ID is: ${data.complaint_id}. Please save this for tracking.`,
      });

      // Reset form
      setFormData({
        complaintType: '',
        description: '',
        location: ''
      });

    } catch (error: any) {
      toast({
        title: "Failed to submit complaint",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="shadow-lg border-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
            Authentication Required
          </CardTitle>
          <CardDescription>Please sign in to submit a complaint</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-orange-100">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
          Submit Public Complaint
        </CardTitle>
        <CardDescription>Submit your complaint and get a tracking ID</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Type</label>
              <select 
                name="complaintType"
                value={formData.complaintType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select complaint type</option>
                <option value="Street Light Issue">Street Light Issue</option>
                <option value="Water Supply Problem">Water Supply Problem</option>
                <option value="Garbage Collection">Garbage Collection</option>
                <option value="Road Condition">Road Condition</option>
                <option value="Drainage Issue">Drainage Issue</option>
                <option value="Tax Related">Tax Related</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location/Ward</label>
              <Input 
                name="location"
                placeholder="Enter location or ward number" 
                value={formData.location}
                onChange={handleInputChange}
                className="border-orange-200 focus:border-orange-500" 
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Description</label>
            <textarea 
              name="description"
              rows={4}
              placeholder="Describe your complaint in detail..."
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <Button 
            type="submit" 
            className="bg-orange-600 hover:bg-orange-700"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Complaint
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComplaintForm;
