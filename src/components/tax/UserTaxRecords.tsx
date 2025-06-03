
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Calendar, IndianRupee } from 'lucide-react';

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

const UserTaxRecords = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const { user } = useAuth();

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
                  <Badge 
                    variant={record.status === 'paid' ? 'default' : 'destructive'}
                    className={record.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1 text-green-600" />
                    <span className="font-medium">₹{record.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-red-600" />
                    <span>Due: {new Date(record.due_date).toLocaleDateString()}</span>
                  </div>
                  {record.paid_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-green-600" />
                      <span>Paid: {new Date(record.paid_date).toLocaleDateString()}</span>
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
