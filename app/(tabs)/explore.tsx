// app/(tabs)/explore.tsx
import ShoppingPage from '@/app/ShoppingPage';
import React from 'react';
import { router } from 'expo-router';

export default function Explore() {
  // Close should just remove the '/explore' segment and return to root
  return <ShoppingPage onClose={() => router.replace('/')} />;
}