
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Calendar, IndianRupee, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaxRecord {
  id: string;
  property_id: string;
  tax_type: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: string;
  financial_year: string;
  created_at: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const UserTaxRecords = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [payingRecord, setPayingRecord] = useState<string | null>(null);
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaxRecords(data || []);
    } catch (error) {
      console.error('Error fetching tax records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (recordId: string) => {
    setPayingRecord(recordId);
    try {
      // Update the tax record status to 'paid' and set paid_date
      const { error } = await supabase
        .from('tax_records')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh the records
      await fetchTaxRecords();
      
      toast({
        title: "Payment Successful",
        description: "Your tax payment has been processed successfully.",
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPayingRecord(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading your tax records...</span>
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
            <p className="text-gray-400">Your tax records will appear here once they are created by the admin</p>
          </div>
        ) : (
          <div className="space-y-4">
            {taxRecords.map((record) => (
              <div key={record.id} className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{record.tax_type}</h3>
                    <p className="text-gray-600">Property ID: {record.property_id}</p>
                    <p className="text-gray-600">Financial Year: {record.financial_year}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={record.status === 'paid' ? 'default' : 'destructive'}
                      className={record.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                    {record.status === 'pending' && (
                      <Button
                        onClick={() => handlePayment(record.id)}
                        disabled={payingRecord === record.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        {payingRecord === record.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1 text-green-600" />
                    <span className="font-medium">₹{record.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-red-600" />
                    <span>Due: {formatDate(record.due_date)}</span>
                  </div>
                  {record.paid_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-green-600" />
                      <span>Paid: {formatDate(record.paid_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTaxRecords;
