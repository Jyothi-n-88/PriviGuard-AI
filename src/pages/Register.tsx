import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { Shield } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    orgName: '',
    orgIndustry: '',
    orgSize: 'small',
    orgCountry: '',
    userName: '',
    userEmail: '',
    password: '',
    confirmPassword: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Basic Validation
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        organization: {
          name: formData.orgName,
          industry: formData.orgIndustry,
          size: formData.orgSize,
          country: formData.orgCountry,
          contactEmail: formData.userEmail, // Using the registering user's email as contact
        },
        user: {
          name: formData.userName,
          email: formData.userEmail,
          password: formData.password,
        },
      });
      
      setSuccessMessage('Registration successful. Please check your email to verify your account before logging in.');
      
      // We will not navigate automatically to login since they need to verify email
      // Let them read the message.
      
    } catch (err: any) {
      // Handled by AuthContext, authError will be populated
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = formError || authError;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl flex flex-col items-center">
        <div className="flex items-center space-x-2 text-primary-600 mb-6">
          <Shield className="h-10 w-10" />
          <span className="text-3xl font-bold tracking-tight">PriviGuard AI</span>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Register your organization
        </h2>
        <p className="text-center text-slate-600 mb-8">
          Set up your organization workspace and Data Protection Officer account.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {displayError && (
                <Alert variant="destructive">
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="border-green-200 bg-green-50 text-green-900">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Organization Details</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name *</Label>
                    <Input
                      id="orgName"
                      name="orgName"
                      required
                      value={formData.orgName}
                      onChange={handleChange}
                      placeholder="Acme Corp"
                      disabled={isSubmitting || !!successMessage}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orgIndustry">Industry</Label>
                    <Input
                      id="orgIndustry"
                      name="orgIndustry"
                      value={formData.orgIndustry}
                      onChange={handleChange}
                      placeholder="e.g. Healthcare, Technology"
                      disabled={isSubmitting || !!successMessage}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgSize">Organization Size</Label>
                    <select
                      id="orgSize"
                      name="orgSize"
                      value={formData.orgSize}
                      onChange={handleChange}
                      disabled={isSubmitting || !!successMessage}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="startup">Startup (1-10)</option>
                      <option value="small">Small (11-50)</option>
                      <option value="medium">Medium (51-200)</option>
                      <option value="large">Large (201-1000)</option>
                      <option value="enterprise">Enterprise (1000+)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgCountry">Country</Label>
                    <Input
                      id="orgCountry"
                      name="orgCountry"
                      value={formData.orgCountry}
                      onChange={handleChange}
                      placeholder="e.g. United States"
                      disabled={isSubmitting || !!successMessage}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">DPO Account Details</h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="userName">Full Name *</Label>
                    <Input
                      id="userName"
                      name="userName"
                      required
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      disabled={isSubmitting || !!successMessage}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="userEmail">Email Address *</Label>
                    <Input
                      id="userEmail"
                      name="userEmail"
                      type="email"
                      required
                      value={formData.userEmail}
                      onChange={handleChange}
                      placeholder="jane.doe@organization.com"
                      disabled={isSubmitting || !!successMessage}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={isSubmitting || !!successMessage}
                    />
                    <p className="text-xs text-slate-500">Must be at least 8 characters long.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={isSubmitting || !!successMessage}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !!successMessage}
              >
                {isSubmitting ? 'Registering...' : 'Register Organization'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
