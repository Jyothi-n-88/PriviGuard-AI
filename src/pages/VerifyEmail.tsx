import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, XCircle, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { authService } from '../services/authService';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get email from React Router state, or gracefully degrade
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;
    
    setStatus('loading');
    setErrorMessage('');
    
    try {
      await authService.verifyEmailOtp(email, otp);
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to verify email. The code may have expired.');
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    
    setResendStatus('loading');
    setResendMessage('');
    
    try {
      const response = await authService.resendEmailOtp(email);
      setResendStatus('success');
      setResendMessage(response.message);
      setCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      setResendStatus('error');
      setResendMessage(error.response?.data?.message || error.message || 'Failed to resend verification email.');
      if (error.response?.status === 429) {
        setCooldown(60); // If rate limited, trigger cooldown anyway
      }
    }
  };

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Email Verified
            </CardTitle>
            <CardDescription>
              Your account is now fully active.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-6">
              You can now log in and start using PriviGuard AI.
            </p>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Verify your email
          </CardTitle>
          <CardDescription>
            We sent a 6-digit verification code to <br />
            <strong>{email || 'your email'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {!location.state?.email && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest h-14 font-mono"
                required
                disabled={status === 'loading'}
              />
            </div>
            
            {status === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={status === 'loading' || otp.length !== 6 || !email}
            >
              {status === 'loading' ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center border-t border-slate-100 pt-6 space-y-4">
          <div className="text-sm text-slate-600 text-center">
            <p className="mb-2">Didn't receive the code?</p>
            {resendStatus === 'error' && (
              <p className="text-red-500 mb-2 text-xs">{resendMessage}</p>
            )}
            {resendStatus === 'success' && (
              <p className="text-green-600 mb-2 text-xs">{resendMessage}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={cooldown > 0 || resendStatus === 'loading' || !email}
            >
              {resendStatus === 'loading' ? 'Sending...' : (cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code')}
            </Button>
          </div>
          
          <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
