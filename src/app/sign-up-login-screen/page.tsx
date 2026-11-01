import React from 'react';
import AuthBrandPanel from './components/AuthBrandPanel';
import AuthFormCard from './components/AuthFormCard';

export default function SignUpLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <AuthBrandPanel />
      <AuthFormCard />
    </div>
  );
}