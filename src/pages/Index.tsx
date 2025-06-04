import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import ComplaintForm from '@/components/complaints/ComplaintForm';
import ComplaintTracker from '@/components/complaints/ComplaintTracker';
import UserTaxRecords from '@/components/tax/UserTaxRecords';
import AdminTaxManagement from '@/components/tax/AdminTaxManagement';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
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

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user, signOut, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const municipalServices = [
    { name: t('services.tradeLicense'), icon: FileText },
    { name: t('services.birthCertificate'), icon: User },
    { name: t('services.deathCertificate'), icon: FileText },
    { name: t('services.propertyRegistration'), icon: Building2 },
    { name: t('services.waterConnection'), icon: Settings },
    { name: t('services.buildingPermit'), icon: Building2 }
  ];

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
                <h1 className="text-2xl font-bold text-gray-900">{t('header.title')}</h1>
                <p className="text-sm text-gray-600">{t('header.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{t('header.welcome')}, {user.email}</span>
                {isAdmin && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {t('header.admin')}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Bell className="w-4 h-4 mr-2" />
                {t('header.notifications')}
              </Button>
              <Button 
                onClick={signOut}
                variant="outline" 
                className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('header.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'hi' ? (
              t('dashboard.welcome')
            ) : (
              <>
                {t('dashboard.welcome')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">{t('dashboard.digitalMuzaffarpur')}</span>
              </>
            )}
          </h2>
          <p className="text-xl text-gray-600 mb-8">{t('dashboard.description')}</p>
          
          {/* Quick Search */}
         
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">{t('stats.totalCollected')}</CardTitle>
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
              <CardTitle className="text-sm font-medium opacity-90">{t('stats.activeProperties')}</CardTitle>
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
              <CardTitle className="text-sm font-medium opacity-90">{t('stats.pendingPayments')}</CardTitle>
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
              <CardTitle className="text-sm font-medium opacity-90">{t('stats.collectionRate')}</CardTitle>
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
          <TabsList className="grid grid-cols-3 h-12 bg-white shadow-md border border-blue-100">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              {isAdmin ? t('tabs.adminDashboard') : t('tabs.dashboard')}
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              {t('tabs.services')}
            </TabsTrigger>
            <TabsTrigger value="complaints" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              {t('tabs.complaints')}
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

          {/* Municipal Services */}
          <TabsContent value="services" className="space-y-6">
            <Card className="shadow-lg border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  {t('services.title')}
                </CardTitle>
                <CardDescription>{t('services.description')}</CardDescription>
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
                          {t('services.available')}
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
              <h3 className="font-semibold text-gray-900 mb-3">{t('footer.contact')}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('footer.office')}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +91-621-2226644
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{t('footer.quickLinks')}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>{t('footer.calculator')}</div>
                <div>{t('footer.application')}</div>
                <div>{t('footer.history')}</div>
                <div>{t('footer.support')}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{t('footer.hours')}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>{t('footer.weekdays')}</div>
                <div>{t('footer.saturday')}</div>
                <div>{t('footer.sunday')}</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
