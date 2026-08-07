import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';

export function DesignShowcase() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">PriviGuard AI Design System</h1>
          <p className="text-lg text-slate-500">Enterprise visual foundation for privacy compliance.</p>
        </div>

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 border-b border-slate-200 pb-2">Typography</h2>
          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div><h1 className="text-4xl font-bold">H1 - Page Title</h1><p className="text-sm text-slate-500">text-4xl font-bold</p></div>
            <div><h2 className="text-3xl font-semibold">H2 - Section Title</h2><p className="text-sm text-slate-500">text-3xl font-semibold</p></div>
            <div><h3 className="text-2xl font-semibold">H3 - Subsection Title</h3><p className="text-sm text-slate-500">text-2xl font-semibold</p></div>
            <div><p className="text-base leading-7 text-slate-700">Body - The quick brown fox jumps over the lazy dog. Enterprise platforms require highly readable, slightly spaced typography to reduce cognitive load during long sessions.</p></div>
            <div><p className="text-sm text-slate-500">Secondary / Muted - Used for helper text, secondary information, and subtle timestamps.</p></div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 border-b border-slate-200 pb-2">Buttons</h2>
          <div className="flex flex-wrap gap-4 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <Button>Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Action</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        {/* Risk Indicators / Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 border-b border-slate-200 pb-2">Risk Indicators & Badges</h2>
          <div className="flex flex-wrap gap-4 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <Badge variant="success">LOW RISK</Badge>
            <Badge variant="warning">MEDIUM RISK</Badge>
            <Badge variant="danger">HIGH RISK</Badge>
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-transparent">CRITICAL RISK</Badge>
            <Badge variant="default">Standard</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* Forms */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 border-b border-slate-200 pb-2">Form Elements</h2>
          <div className="max-w-md space-y-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="dpo@company.com" />
              <p className="text-sm text-slate-500">Enter your organizational email.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org">Organization Name</Label>
              <Input id="org" placeholder="Acme Corp" disabled />
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 border-b border-slate-200 pb-2">Cards & Containers</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Assessment</CardTitle>
                <CardDescription>Review the latest data processing activities.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">This assessment covers the new customer portal rollout and identifies 3 medium-level risks.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Details</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Risk Score</CardTitle>
                  <Badge variant="danger">HIGH</Badge>
                </div>
                <CardDescription>Calculated by AI Risk Engine</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900">78<span className="text-lg text-slate-500 font-normal">/100</span></div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 border-b border-slate-200 pb-2">Alerts & Feedback</h2>
          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <Alert>
              <div className="h-4 w-4 bg-slate-900 rounded-full" />
              <AlertTitle>System Update</AlertTitle>
              <AlertDescription>The new DPDP Act compliance templates are now available.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <div className="h-4 w-4 bg-red-600 rounded-full" />
              <AlertTitle>Compliance Gap Detected</AlertTitle>
              <AlertDescription>Missing explicit consent mechanism in the customer registration flow.</AlertDescription>
            </Alert>
            <Alert variant="warning">
               <div className="h-4 w-4 bg-amber-500 rounded-full" />
              <AlertTitle>Review Required</AlertTitle>
              <AlertDescription>3 privacy assessments are pending DPO approval.</AlertDescription>
            </Alert>
            <Alert variant="success">
               <div className="h-4 w-4 bg-emerald-500 rounded-full" />
              <AlertTitle>Remediation Complete</AlertTitle>
              <AlertDescription>Data retention policies have been successfully updated.</AlertDescription>
            </Alert>
          </div>
        </section>

      </div>
    </div>
  );
}
