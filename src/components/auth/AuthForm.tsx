import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, Building2, Shield, Users, CheckCircle } from 'lucide-react';

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    aadharNumber: '',
    confirmPassword: ''
  });
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to main page
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Validate Aadhar number format (12 digits)
    if (formData.aadharNumber.length !== 12 || !/^\d{12}$/.test(formData.aadharNumber)) {
      toast({
        title: "Invalid Aadhar Number",
        description: "Aadhar number must be exactly 12 digits.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Signing up user with data:', {
        email: formData.email,
        full_name: formData.fullName,
        phone: formData.phone,
        aadhar_number: formData.aadharNumber
      });

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            aadhar_number: formData.aadharNumber
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification link. Your Aadhar number has been recorded.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex items-center gap-12">
        {/* Left side - Welcome content */}
        <div className="hidden lg:flex flex-1 flex-col space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-green-600 p-3 rounded-xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Muzaffarpur</h1>
                <p className="text-xl text-gray-600">Seva Sathi</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Digital Municipal Services
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Efficient tracking and management of municipal taxes, services, and complaints
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-white/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Tax Management</h3>
                <p className="text-gray-600">Track and pay your municipal taxes securely online</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Public Services</h3>
                <p className="text-gray-600">Access various municipal services and applications</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="bg-orange-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Complaint Tracking</h3>
                <p className="text-gray-600">Submit and track your public complaints easily</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-1 max-w-md mx-auto lg:mx-0">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="bg-gradient-to-br from-blue-600 to-green-600 p-3 rounded-xl">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Muzaffarpur Seva Sathi
              </CardTitle>
              <CardDescription className="text-base">
                Access your municipal services account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all duration-200"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="h-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Full Name *</label>
                      <Input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address *</label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Aadhar Number * (Required for tax records)</label>
                      <Input
                        type="text"
                        name="aadharNumber"
                        placeholder="Enter your 12-digit Aadhar number"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        required
                        maxLength={12}
                        pattern="[0-9]{12}"
                        className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500">
                        Your Aadhar number is required for creating tax records and identifying your account.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Password *</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength={6}
                          className="h-11 pr-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                        className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating account...
                        </div>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
