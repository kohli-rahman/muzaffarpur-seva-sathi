
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { PlusCircle, Receipt, Trash2, Pencil, User, Calendar, MapPin, AlertTriangle } from 'lucide-react';

interface TaxRecord {
  id: string;
  user_id: string;
  property_id: string;
  tax_type: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  property_address: string | null;
  payment_date: string | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
}

const AdminTaxManagement = () => {
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTaxRecord, setSelectedTaxRecord] = useState<TaxRecord | null>(null);
  const [formData, setFormData] = useState<Omit<TaxRecord, 'id' | 'payment_date' | 'status'> & { status: string }>({
    user_id: '',
    property_id: '',
    tax_type: '',
    amount: 0,
    due_date: '',
    status: 'pending',
    property_address: '',
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch tax records
      const { data: taxData, error: taxError } = await supabase
        .from('tax_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (taxError) throw taxError;

      // Fetch user profiles
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (userError) throw userError;

      // Get user emails from auth
      const userIds = userData.map(profile => profile.id);
      const emails: Record<string, string> = {};
      
      for (const userId of userIds) {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user) {
          emails[userId] = authUser.user.email || '';
        }
      }

      const usersWithEmail = userData.map(profile => ({
        ...profile,
        email: emails[profile.id] || ''
      }));

      setTaxRecords(taxData || []);
      setUsers(usersWithEmail);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setFormData({
      user_id: '',
      property_id: '',
      tax_type: '',
      amount: 0,
      due_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      property_address: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (record: TaxRecord) => {
    setIsEditMode(true);
    setSelectedTaxRecord(record);
    setFormData({
      user_id: record.user_id,
      property_id: record.property_id,
      tax_type: record.tax_type,
      amount: record.amount,
      due_date: new Date(record.due_date).toISOString().split('T')[0],
      status: record.status,
      property_address: record.property_address || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (record: TaxRecord) => {
    setSelectedTaxRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTaxRecord) return;
    try {
      const { error } = await supabase
        .from('tax_records')
        .delete()
        .eq('id', selectedTaxRecord.id);
      
      if (error) throw error;

      toast({
        title: "Tax record deleted",
        description: "The tax record has been deleted successfully."
      });
      
      setTaxRecords(records => records.filter(record => record.id !== selectedTaxRecord.id));
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error deleting record",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedTaxRecord) {
        // Update existing record
        const { error } = await supabase
          .from('tax_records')
          .update({
            user_id: formData.user_id,
            property_id: formData.property_id,
            tax_type: formData.tax_type,
            amount: formData.amount,
            due_date: formData.due_date,
            status: formData.status,
            property_address: formData.property_address || null,
          })
          .eq('id', selectedTaxRecord.id);

        if (error) throw error;

        toast({
          title: "Tax record updated",
          description: "The tax record has been updated successfully."
        });

        // Update the local state
        setTaxRecords(records => 
          records.map(record => 
            record.id === selectedTaxRecord.id 
              ? { 
                  ...record, 
                  user_id: formData.user_id,
                  property_id: formData.property_id,
                  tax_type: formData.tax_type,
                  amount: formData.amount,
                  due_date: formData.due_date,
                  status: formData.status as 'paid' | 'pending' | 'overdue',
                  property_address: formData.property_address || null
                } 
              : record
          )
        );
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('tax_records')
          .insert({
            user_id: formData.user_id,
            property_id: formData.property_id,
            tax_type: formData.tax_type,
            amount: formData.amount,
            due_date: formData.due_date,
            status: formData.status,
            property_address: formData.property_address || null,
          })
          .select();

        if (error) throw error;

        toast({
          title: "Tax record created",
          description: "The tax record has been created successfully."
        });

        // Add the new record to the local state
        if (data && data[0]) {
          setTaxRecords([data[0], ...taxRecords]);
        }
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error saving record",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || 'Unknown User';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <>
      <Card className="shadow-lg border-blue-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-600" />
              Tax Records Management
            </CardTitle>
            <CardDescription>Create, edit, and manage municipal tax records</CardDescription>
          </div>
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Tax Record
          </Button>
        </CardHeader>
        <CardContent>
          {taxRecords.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No tax records found</p>
              <p className="text-gray-400">Create tax records by clicking the button above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {taxRecords.map((record) => (
                <div key={record.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex-1 mb-3 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{record.tax_type}</h3>
                      <Badge className={`${getStatusColor(record.status)} border`}>
                        <span className="capitalize">{record.status}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {getUserName(record.user_id)}
                      </div>
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 mr-1" />
                        Property ID: {record.property_id}
                      </div>
                      {record.property_address && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {record.property_address}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {new Date(record.due_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <p className="text-lg font-bold text-gray-900 mr-4">₹{Number(record.amount).toLocaleString()}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(record)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Tax Record" : "Create Tax Record"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the tax record details below" : "Fill in the details to create a new tax record"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select 
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange as any}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || 'Unknown'} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                <select 
                  name="tax_type"
                  value={formData.tax_type}
                  onChange={handleInputChange as any}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select tax type</option>
                  <option value="Property Tax">Property Tax</option>
                  <option value="Trade License">Trade License</option>
                  <option value="Advertisement Tax">Advertisement Tax</option>
                  <option value="Mobile Tower Fee">Mobile Tower Fee</option>
                  <option value="Water Tax">Water Tax</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
                <Input 
                  name="property_id"
                  value={formData.property_id}
                  onChange={handleInputChange}
                  placeholder="Enter property ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                <Input 
                  name="property_address"
                  value={formData.property_address || ''}
                  onChange={handleInputChange}
                  placeholder="Enter property address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <Input 
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  required
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <Input 
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange as any}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                {isEditMode ? "Update Record" : "Create Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tax record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Warning</p>
              <p className="text-sm text-red-600">Deleting this record will permanently remove it from the system.</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTaxManagement;
