import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Receipt, Search, Edit, Trash2, User } from 'lucide-react';

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

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  aadhar_number: string;
  address: string;
  email?: string;
}

const AdminTaxManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      console.log('=== FETCHING ADMIN TAX DATA ===');
      
      // Fetch all tax records
      const { data: taxData, error: taxError } = await supabase
        .from('tax_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (taxError) {
        console.error('Tax records error:', taxError);
        throw taxError;
      }

      console.log('Tax records fetched:', taxData?.length || 0);

      // First try to fetch from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('full_name', 'is', null)
        .not('phone', 'is', null)
        .not('aadhar_number', 'is', null)
        .neq('full_name', '')
        .neq('phone', '')
        .neq('aadhar_number', '')
        .order('created_at', { ascending: false });

      let validUsers: UserProfile[] = [];

      if (profilesData && profilesData.length > 0) {
        console.log('Found profiles in profiles table:', profilesData.length);
        
        profilesData.forEach((profile) => {
          const hasValidName = profile.full_name && profile.full_name.trim().length >= 2;
          const hasValidPhone = profile.phone && profile.phone.length === 10 && /^\d{10}$/.test(profile.phone);
          const hasValidAadhar = profile.aadhar_number && profile.aadhar_number.length === 12 && /^\d{12}$/.test(profile.aadhar_number);
          const hasValidAddress = profile.address && profile.address.trim().length >= 5;

          if (hasValidName && hasValidPhone && hasValidAadhar && hasValidAddress) {
            validUsers.push({
              id: profile.id,
              full_name: profile.full_name.trim(),
              phone: profile.phone,
              aadhar_number: profile.aadhar_number,
              address: profile.address.trim(),
              email: ''
            });
          }
        });
      }

      // If no valid users found in profiles, try to fetch from auth.users metadata
      if (validUsers.length === 0) {
        console.log('No valid profiles found, checking auth.users metadata...');
        
        try {
          // Use admin access to get auth users
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.error('Auth users error:', authError);
          } else {
            console.log('Auth users found:', authUsers.users?.length || 0);
            
            authUsers.users?.forEach((authUser) => {
              const metadata = authUser.raw_user_meta_data || {};
              const hasValidName = metadata.full_name && metadata.full_name.trim().length >= 2;
              const hasValidPhone = metadata.phone && metadata.phone.length === 10 && /^\d{10}$/.test(metadata.phone);
              const hasValidAadhar = metadata.aadhar_number && metadata.aadhar_number.length === 12 && /^\d{12}$/.test(metadata.aadhar_number);
              const hasValidAddress = metadata.address && metadata.address.trim().length >= 5;

              if (hasValidName && hasValidPhone && hasValidAadhar && hasValidAddress) {
                validUsers.push({
                  id: authUser.id,
                  full_name: metadata.full_name.trim(),
                  phone: metadata.phone,
                  aadhar_number: metadata.aadhar_number,
                  address: metadata.address.trim(),
                  email: authUser.email || ''
                });

                // Also sync this user to profiles table for future use
                supabase
                  .from('profiles')
                  .upsert({
                    id: authUser.id,
                    full_name: metadata.full_name.trim(),
                    phone: metadata.phone,
                    aadhar_number: metadata.aadhar_number,
                    address: metadata.address.trim()
                  })
                  .then(() => console.log(`Synced user ${metadata.full_name} to profiles table`));
              }
            });
          }
        } catch (authFetchError) {
          console.log('Could not fetch auth users, proceeding with profiles only');
        }
      }

      console.log('=== FINAL RESULTS ===');
      console.log('Total valid users:', validUsers.length);
      console.log('Valid users:', validUsers);

      setTaxRecords(taxData || []);
      setUsers(validUsers);

      if (validUsers.length === 0) {
        toast({
          title: "No Valid Users Found",
          description: "All users must have valid 10-digit phone numbers and 12-digit Aadhar numbers to create tax records.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error fetching data",
        description: "Failed to load tax records and user data.",
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

      // Reset form and refresh data
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
      fetchData();

    } catch (error: any) {
      toast({
        title: "Failed to save tax record",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
        title: "Failed to delete tax record",
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
        title: "Failed to update tax record",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredRecords = taxRecords.filter(record => {
    const user = users.find(u => u.id === record.user_id);
    return (
      record.property_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tax_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.aadhar_number?.includes(searchTerm)
    );
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading tax management data...</span>
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
              Create and manage municipal tax records. 
              Found {users.length} valid users with complete profiles.
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Button 
              onClick={fetchData}
              variant="outline"
              size="sm"
            >
              Refresh Data
            </Button>
            <Button 
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setEditingRecord(null);
                setFormData({
                  user_id: '',
                  property_id: '',
                  tax_type: '',
                  amount: '',
                  due_date: '',
                  financial_year: new Date().getFullYear().toString()
                });
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={users.length === 0}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Tax Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by property ID, tax type, user name, or Aadhar number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">System Status</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Valid users available: {users.length}</p>
              <p>• Total tax records: {taxRecords.length}</p>
              <p>• All users have verified phone (10 digits) and Aadhar (12 digits) numbers</p>
              {users.length > 0 && (
                <p>• Users loaded from: {users.length > 0 ? 'Auth metadata + Profiles sync' : 'Profiles table only'}</p>
              )}
            </div>
          </div>

          {users.length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">No Valid Users</h4>
              <div className="text-sm text-yellow-700">
                <p>No users with complete and valid profiles found. Users need:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Full name (at least 2 characters)</li>
                  <li>Valid 10-digit phone number</li>
                  <li>Valid 12-digit Aadhar number</li>
                  <li>Complete address (at least 5 characters)</li>
                </ul>
                <p className="mt-2">Ask users to sign up again with all required information.</p>
              </div>
            </div>
          )}

          {/* Create/Edit Form */}
          {showCreateForm && users.length > 0 && (
            <Card className="mb-6 border-green-200">
              <CardHeader>
                <CardTitle>{editingRecord ? 'Edit Tax Record' : 'Create New Tax Record'}</CardTitle>
                <CardDescription>
                  Select from {users.length} verified users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select User ({users.length} available)
                      </label>
                      <select
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a verified user</option>
                        {users.map((userProfile) => (
                          <option key={userProfile.id} value={userProfile.id}>
                            {userProfile.full_name} | {userProfile.phone} | {userProfile.aadhar_number}
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
                        <option value="Mobile Tower Fee">Mobile Tower Fee</option>
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
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingRecord(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tax Records List */}
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No tax records found</p>
                <p className="text-gray-400">
                  {users.length === 0 
                    ? "No valid users available to create tax records" 
                    : "Create your first tax record using the button above"
                  }
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const userInfo = users.find(u => u.id === record.user_id);
                return (
                  <div key={record.id} className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          <h3 className="font-semibold text-lg">{userInfo?.full_name || 'Unknown User'}</h3>
                          <Badge variant="outline" className="ml-2">{userInfo?.aadhar_number}</Badge>
                        </div>
                        <p className="text-gray-600">Property ID: {record.property_id}</p>
                        <p className="text-gray-600">Tax Type: {record.tax_type}</p>
                        <p className="text-gray-600">Financial Year: {record.financial_year}</p>
                        <p className="text-gray-600">Amount: ₹{record.amount.toLocaleString()}</p>
                        <p className="text-gray-600">Due Date: {new Date(record.due_date).toLocaleDateString()}</p>
                        {record.paid_date && (
                          <p className="text-green-600">Paid Date: {new Date(record.paid_date).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant={record.status === 'paid' ? 'default' : 'destructive'}
                          className={record.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(record)}
                          >
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
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTaxManagement;
