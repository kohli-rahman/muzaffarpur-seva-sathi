
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { PlusCircle, Receipt } from 'lucide-react';

const AdminTaxManagement = () => {
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-blue-600" />
            Tax Records Management
          </CardTitle>
          <CardDescription>Create, edit, and manage municipal tax records</CardDescription>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Tax Record
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Admin tax management system is being set up</p>
          <p className="text-gray-400">Tax record management features will be available once the database is fully configured</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTaxManagement;
