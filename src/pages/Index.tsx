
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthContext';
import ComplaintForm from '@/components/complaints/ComplaintForm';
import ComplaintTracker from '@/components/complaints/ComplaintTracker';
import UserTaxRecords from '@/components/tax/UserTaxRecords';
import AdminTaxManagement from '@/components/tax/AdminTaxManagement';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  CreditCard, 
  FileText, 
  MapPin, 
  Phone, 
  Search, 
  Bell, 
  Receipt, 
  Calendar,
  IndianRupee,
  ShieldCheck,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  LogOut,
  User,
  Settings
} from 'lucide-react';

const municipalServices = [
  { name: 'Trade License', icon: FileText },
  { name: 'Birth Certificate', icon: User },
  { name: 'Death Certificate', icon: FileText },
  { name: 'Property Registration', icon: Building2 },
  { name: 'Water Connection', icon: Settings },
  { name: 'Building Permit', icon: Building2 }
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user, signOut, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (user) {
      checkIfAdmin();
    }
  }, [user, isLoading, navigate]);

  const checkIfAdmin = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-green-600 p-2 rounded-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Muzaffarpur Seva Sathi</h1>
                <p className="text-sm text-gray-600">Smart Tax Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Welcome, {user.email}</span>
                {isAdmin && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    Admin
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button 
                onClick={signOut}
                variant="outline" 
                className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">Digital Muzaffarpur</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">Efficient tracking and management of municipal taxes and services</p>
          
          {/* Quick Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by Property ID or Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <IndianRupee className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">₹48,00,000</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Building2 className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">2,847</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">156</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">89.5%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 h-12 bg-white shadow-md border border-blue-100">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              {isAdmin ? 'Admin Dashboard' : 'Tax Dashboard'}
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Quick Payment
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Municipal Services
            </TabsTrigger>
            <TabsTrigger value="complaints" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Complaints
            </TabsTrigger>
          </TabsList>

          {/* Tax Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {isAdmin ? (
              <AdminTaxManagement />
            ) : (
              <UserTaxRecords />
            )}
          </TabsContent>

          {/* Quick Payment */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="shadow-lg border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  Quick Payment Portal
                </CardTitle>
                <CardDescription>Pay your municipal taxes instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property/Business ID</label>
                    <Input placeholder="Enter your Property ID" className="border-green-200 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Type</label>
                    <select className="w-full px-3 py-2 border border-green-200 rounded-md focus:ring-green-500 focus:border-green-500">
                      <option>Property Tax</option>
                      <option>Trade License</option>
                      <option>Advertisement Tax</option>
                      <option>Mobile Tower Fee</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Amount:</span>
                      <span>₹15,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Late Fee:</span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-800 pt-2 border-t border-green-300">
                      <span>Total Amount:</span>
                      <span>₹15,000</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 text-lg">
                  Proceed to Payment Gateway
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Municipal Services */}
          <TabsContent value="services" className="space-y-6">
            <Card className="shadow-lg border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Municipal Services
                </CardTitle>
                <CardDescription>Access various municipal services and applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {municipalServices.map((service, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer border border-purple-100 hover:border-purple-300">
                      <CardContent className="p-4 text-center">
                        <service.icon className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                        <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complaints */}
          <TabsContent value="complaints" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComplaintForm />
              <ComplaintTracker />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 bg-white rounded-lg shadow-lg border border-blue-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Municipal Corporation Office, Muzaffarpur
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +91-621-2226644
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Property Tax Calculator</div>
                <div>Trade License Application</div>
                <div>Payment History</div>
                <div>Help & Support</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Office Hours</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Monday - Friday: 10:00 AM - 6:00 PM</div>
                <div>Saturday: 10:00 AM - 2:00 PM</div>
                <div>Sunday: Closed</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
