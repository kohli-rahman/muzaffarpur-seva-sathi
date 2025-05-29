
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { Receipt } from 'lucide-react';

const UserTaxRecords = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Tax records system is being set up</p>
          <p className="text-gray-400">Your tax records will appear here once the system is fully configured</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTaxRecords;
