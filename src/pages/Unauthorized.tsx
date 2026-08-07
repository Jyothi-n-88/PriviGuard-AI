import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-slate-900">Access Denied</CardTitle>
          <CardDescription className="mt-2 text-slate-600">
            You do not have the required permissions to view this page.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link to="/dashboard">
            <Button variant="default">Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
