import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function GuestInformation() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Guest Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="e.g. Rahul" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="e.g. Sharma" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="rahul@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+91 98765 43210" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message to Host (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Tell the host a bit about yourself and your trip..."
            className="resize-none h-24"
          />
        </div>
      </CardContent>
    </Card>
  );
}
