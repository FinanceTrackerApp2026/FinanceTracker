import {
  ArrowLeftRight,
  HandCoins,
  LayoutDashboard,
  TrendingUp,
  UsersRound,
} from 'lucide-react';

import type { NavigationItem } from '../types/navigation';

export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Your financial overview',
  },
  {
    label: 'Contacts',
    path: '/contacts',
    icon: UsersRound,
    description: 'Manage your contacts',
  },
  {
    label: 'Loans',
    path: '/loans',
    icon: HandCoins,
    description: 'Track active loans',
  },
  {
    label: 'Payments',
    path: '/payments',
    icon: ArrowLeftRight,
    description: 'Review payment activity',
  },
  {
    label: 'Cash flow',
    path: '/cash-flow',
    icon: TrendingUp,
    description: 'Analyze monthly movement',
  },
];
