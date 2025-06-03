
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Receipt, User, Edit, Trash2 } from 'lucide-react';

interface TaxRecord {
  id: string;
  user_id: string;
  property_id: string;
  tax_type: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: string;
  financial_year: string;
  created_at: string;
}

interface UserData {
  id: string;
  email: string;
  full_name: string;
}

const AdminTaxManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TaxRecord | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    property_id: '',
    tax_type: '',
    amount: '',
    due_date: '',
    financial_year: new Date().getFullYear().toString()
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch tax records
      const { data: taxData, error: taxError } = await supabase
        .from('tax_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (taxError) throw taxError;

      // Fetch users from auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      const validUsers: UserData[] = authUsers.users.map(authUser => ({
        id: authUser.id,
        email: authUser.email || 'No email',
        full_name: authUser.user_metadata?.full_name || 'Unknown User'
      }));

      setTaxRecords(taxData || []);
      setUsers(validUsers);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const recordData = {
        user_id: formData.user_id,
        property_id: formData.property_id,
        tax_type: formData.tax_type,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        financial_year: formData.financial_year,
        status: 'pending'
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('tax_records')
          .update(recordData)
          .eq('id', editingRecord.id);

        if (error) throw error;
        toast({ title: "Tax record updated successfully!" });
      } else {
        const { error } = await supabase
          .from('tax_records')
          .insert(recordData);

        if (error) throw error;
        toast({ title: "Tax record created successfully!" });
      }

      resetForm();
      fetchData();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      property_id: '',
      tax_type: '',
      amount: '',
      due_date: '',
      financial_year: new Date().getFullYear().toString()
    });
    setShowCreateForm(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: TaxRecord) => {
    setEditingRecord(record);
    setFormData({
      user_id: record.user_id,
      property_id: record.property_id,
      tax_type: record.tax_type,
      amount: record.amount.toString(),
      due_date: record.due_date,
      financial_year: record.financial_year
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this tax record?')) return;

    try {
      const { error } = await supabase
        .from('tax_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      toast({ title: "Tax record deleted successfully!" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const markAsPaid = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('tax_records')
        .update({ 
          status: 'paid', 
          paid_date: new Date().toISOString().split('T')[0] 
        })
        .eq('id', recordId);

      if (error) throw error;
      toast({ title: "Tax record marked as paid!" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || 'Unknown User';
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-blue-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-600" />
              Tax Records Management
            </CardTitle>
            <CardDescription>
              Create and manage municipal tax records for registered users
            </CardDescription>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Tax Record
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="mb-6 border-green-200">
              <CardHeader>
                <CardTitle>{editingRecord ? 'Edit Tax Record' : 'Create New Tax Record'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select User
                      </label>
                      <select
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name} - {user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property ID</label>
                      <Input
                        name="property_id"
                        value={formData.property_id}
                        onChange={handleInputChange}
                        placeholder="Enter property ID"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax Type</label>
                      <select
                        name="tax_type"
                        value={formData.tax_type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select tax type</option>
                        <option value="Property Tax">Property Tax</option>
                        <option value="Trade License">Trade License</option>
                        <option value="Advertisement Tax">Advertisement Tax</option>
                        <option value="Water Tax">Water Tax</option>
                        <option value="Sewerage Tax">Sewerage Tax</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                      <Input
                        name="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <Input
                        name="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Financial Year</label>
                      <Input
                        name="financial_year"
                        value={formData.financial_year}
                        onChange={handleInputChange}
                        placeholder="e.g., 2024-25"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isLoading}>
                      {editingRecord ? 'Update Record' : 'Create Record'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tax Records List */}
          <div className="space-y-4">
            {taxRecords.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No tax records found</p>
                <p className="text-gray-400">Create your first tax record using the button above</p>
              </div>
            ) : (
              taxRecords.map((record) => (
                <div key={record.id} className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        <h3 className="font-semibold text-lg">{getUserName(record.user_id)}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>Property: {record.property_id}</p>
                        <p>Type: {record.tax_type}</p>
                        <p>Amount: ₹{record.amount.toLocaleString()}</p>
                        <p>Due: {new Date(record.due_date).toLocaleDateString()}</p>
                        <p>Year: {record.financial_year}</p>
                        {record.paid_date && (
                          <p className="text-green-600">Paid: {new Date(record.paid_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        variant={record.status === 'paid' ? 'default' : 'destructive'}
                        className={record.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {record.status === 'pending' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => markAsPaid(record.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(record.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTaxManagement;
