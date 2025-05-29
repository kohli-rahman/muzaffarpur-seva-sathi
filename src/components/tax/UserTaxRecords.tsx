
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Receipt, Calendar, IndianRupee, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TaxRecord {
  id: string;
  property_id: string;
  tax_type: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  property_address: string | null;
  payment_date: string | null;
  created_at: string;
}

const UserTaxRecords = () => {
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTaxRecords();
    }
  }, [user]);

  const fetchTaxRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      setTaxRecords(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to fetch tax records",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-blue-600" />
          Your Tax Records
        </CardTitle>
        <CardDescription>View all your municipal tax payments and dues</CardDescription>
      </CardHeader>
      <CardContent>
        {taxRecords.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No tax records found</p>
            <p className="text-gray-400">Tax records will appear here once they are assigned by the administration</p>
          </div>
        ) : (
          <div className="space-y-4">
            {taxRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{record.tax_type}</h3>
                    <Badge className={`${getStatusColor(record.status)} border`}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1 capitalize">{record.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Property ID: {record.property_id}</p>
                  {record.property_address && (
                    <p className="text-sm text-gray-600">{record.property_address}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{Number(record.amount).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {record.status === 'paid'
                      ? `Paid on: ${new Date(record.payment_date!).toLocaleDateString()}`
                      : `Due: ${new Date(record.due_date).toLocaleDateString()}`}
                  </p>
                </div>
                {record.status !== 'paid' && (
                  <Button className="ml-4 bg-blue-600 hover:bg-blue-700">
                    Pay Now
                  </Button>
                )}
                {record.status === 'paid' && (
                  <Button variant="outline" className="ml-4">
                    View Receipt
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTaxRecords;
