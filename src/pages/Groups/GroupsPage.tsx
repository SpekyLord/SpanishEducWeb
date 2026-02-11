import React from 'react';
import { Users } from 'lucide-react';
import { Header } from '../../components/layout/Header';

export const GroupsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-fb-bg">
      <Header variant="feed" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-fb-hover shadow-glow-gold flex items-center justify-center mb-6">
            <Users size={40} className="text-gold" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-light mb-3 heading-accent">Groups</h1>
          <p className="text-light/50 text-lg max-w-md">
            Study groups and class communities are coming soon. Stay tuned!
          </p>
        </div>
      </main>
    </div>
  );
};
