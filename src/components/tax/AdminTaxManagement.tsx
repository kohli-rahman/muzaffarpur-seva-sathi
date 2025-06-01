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
      console.log('Fetching tax records and users...');
      console.log('Current user:', user);
      
      // Fetch all tax records for admin view
      const { data: taxData, error: taxError } = await supabase
        .from('tax_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (taxError) {
        console.error('Tax records error:', taxError);
        throw taxError;
      }

      console.log('Tax records fetched:', taxData?.length || 0);

      // Fetch all profiles from the database
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching all profiles:', profilesError);
        throw profilesError;
      }

      console.log('All profiles from database:', allProfiles?.length || 0);
      console.log('All profiles data:', allProfiles);

      // Filter profiles with valid Aadhar numbers and complete information
      const validUsers: UserProfile[] = [];
      
      if (allProfiles && allProfiles.length > 0) {
        allProfiles.forEach((profile, index) => {
          console.log(`Processing profile ${index + 1}:`, {
            id: profile.id,
            full_name: profile.full_name,
            aadhar_number: profile.aadhar_number,
            phone: profile.phone,
            address: profile.address
          });

          // Check if profile has valid Aadhar number (exactly 12 digits)
          const hasValidAadhar = profile.aadhar_number && 
                                 typeof profile.aadhar_number === 'string' &&
                                 profile.aadhar_number.length === 12 &&
                                 /^\d{12}$/.test(profile.aadhar_number);

          // Check if profile has valid name
          const hasValidName = profile.full_name && 
                              typeof profile.full_name === 'string' &&
                              profile.full_name.trim().length > 0;

          // Check if profile has phone
          const hasPhone = profile.phone && 
                          typeof profile.phone === 'string' &&
                          profile.phone.trim().length > 0;

          console.log(`Profile ${profile.id} validation:`, {
            hasValidAadhar,
            hasValidName,
            hasPhone,
            aadhar: profile.aadhar_number,
            name: profile.full_name,
            phone: profile.phone
          });

          if (hasValidAadhar && hasValidName && hasPhone) {
            validUsers.push({
              id: profile.id,
              full_name: profile.full_name,
              phone: profile.phone,
              aadhar_number: profile.aadhar_number,
              address: profile.address || 'No Address',
              email: ''
            });
            console.log(`Added valid user: ${profile.full_name} (${profile.aadhar_number})`);
          } else {
            console.log(`Skipped invalid user: ${profile.full_name} - Missing:`, {
              aadhar: !hasValidAadhar,
              name: !hasValidName,
              phone: !hasPhone
            });
          }
        });
      }

      console.log('Valid users found:', validUsers.length);
      console.log('Valid users list:', validUsers);

      setTaxRecords(taxData || []);
      setUsers(validUsers);

      if (validUsers.length === 0) {
        console.warn('No valid users found. Users need to complete registration with valid 12-digit Aadhar numbers, full names, and phone numbers.');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error fetching data",
        description: "Failed to load tax records and user data. Check console for details.",
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
              Create, edit, and manage municipal tax records for all citizens. 
              Found {users.length} registered users with valid Aadhar numbers.
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Button 
              onClick={() => {
                console.log('Refreshing data...');
                fetchData();
              }}
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
              <p>• Total profiles in database: Loading...</p>
              <p>• Valid users with complete data: {users.length}</p>
              <p>• Tax records: {taxRecords.length}</p>
            </div>
          </div>

          {/* Debug Info for no users */}
          {users.length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">No Valid Users Found</h4>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>For users to appear in the tax system, they must have:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>A valid 12-digit Aadhar number (numbers only)</li>
                  <li>A complete full name</li>
                  <li>A phone number</li>
                  <li>Completed registration through the signup form</li>
                </ul>
                <p className="mt-2 font-medium">Users must sign up at <strong>/auth</strong> to be registered in the system.</p>
              </div>
            </div>
          )}

          {/* Create/Edit Form */}
          {showCreateForm && (
            <Card className="mb-6 border-green-200">
              <CardHeader>
                <CardTitle>{editingRecord ? 'Edit Tax Record' : 'Create New Tax Record'}</CardTitle>
                <CardDescription>
                  Available users: {users.length} registered users with valid Aadhar numbers
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
                        <option value="">
                          {users.length === 0 ? 'No users available' : `Select from ${users.length} users`}
                        </option>
                        {users.map((userProfile) => (
                          <option key={userProfile.id} value={userProfile.id}>
                            {userProfile.aadhar_number} - {userProfile.full_name} - {userProfile.phone}
                          </option>
                        ))}
                      </select>
                      {users.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          No users available. Users need to complete registration with valid Aadhar numbers, full names, and phone numbers.
                        </p>
                      )}
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
                    <Button type="submit" disabled={isLoading || users.length === 0}>
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
                <p className="text-gray-400">Create your first tax record using the button above</p>
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
