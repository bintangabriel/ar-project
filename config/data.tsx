'use client';

import { Avatar, type MenuProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { User } from '../type/user.type';
import Link from 'next/link';
import { Icon } from "@iconify/react";
import Button from '../components/common/Button';

export type MenuItem = Required<MenuProps>['items'][number];

export interface CabangOption {
  value: string;
  label: string;
}

export const getNavbarData = (isAuthenticated: boolean): MenuItem[] => [
  {
    label: 'Dashboard',
    key: 'dashboard',
    children: [
      {
        label: <Link href="/dashboard" prefetch={false}>Dashboard</Link>,
        key: 'dashboard',
      },
      {
        label: <Link href="/dashboard-peojf" prefetch={false}>Dashboard Peojf</Link>,
        key: 'dashboard-peojf',
      },
      ...(isAuthenticated
        ? [{
          label: <Link href="/peojf-recommendation" prefetch={false}>Rekomendasi PEOJF</Link>,
          key: 'peojf-recommendation',
        }]
        : []),
    ],
  },
  ...(
    isAuthenticated
      ? [
        {
          label:  <Link href="/upload-file" prefetch={false}>Upload File</Link>,
          key: 'upload-file'
        }
      ]
      : []
  ),
  {
    label: <Link href="/tentang-kami" prefetch={false}>Tentang Kami</Link>,
    key: 'tentang-kami',
  },
];

export const getProfile = (user?: User['user'] | null, handleLogout?: () => void): MenuItem[] => {
  if (!user) {
    return [
      {
        key: 'login',
        label: (
          <Link href="/login" prefetch={false}>
            <Button type="primary">
              Login
            </Button>
          </Link>
        ),
      },
    ];
  }

  return [
    {
      key: 'user-dropdown',
      label: (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{user.name ?? 'Guest'}</span>
        </div>
      ),
      children: [
        {
          label: <Link href="/profile" prefetch={false}>Profile</Link>,
          key: 'profile',
        },
        {
          label: <div onClick={handleLogout}>Logout</div>, // ✅ logout handler
          key: 'logout',
        },
      ],
    },
  ];
};


export const footerSections = [
  {
    title: 'Products',
    links: [
      { href: '#', label: 'PEOJF Recommendation' },
      { href: '#', label: 'Interactive Dashboard' },
      { href: '#', label: 'Data Input' },
    ],
  },
];

export const features = [
  {
    title: "Simulasi Tryout Nyata",
    description:
      "Rasakan atmosfer ujian sesungguhnya dengan sistem waktu & nilai otomatis.",
    icon: <Icon icon="mdi:timer-outline" />,
  },
  {
    title: "Analisis Hasil Cerdas",
    description:
      "Dapatkan insight performa lengkap & rekomendasi belajar otomatis.",
    icon: <Icon icon="mdi:chart-box-outline" />,
  },
  {
    title: "Tur Kampus Virtual",
    description:
      "Jelajahi kampus impian secara interaktif tanpa harus datang langsung.",
    icon: <Icon icon="mdi:school-outline" />,
  },
  {
    title: "Komunitas Belajar",
    description:
      "Gabung bersama ribuan pejuang PTN & saling support menuju impian.",
    icon: <Icon icon="mdi:account-group-outline" />,
  },
  {
    title: "Leaderboard & Badge",
    description: "Bersaing seru dengan teman dan raih badge pencapaianmu!",
    icon: <Icon icon="mdi:trophy-outline" />,
  },
  {
    title: "Akses Fleksibel",
    description: "Latihan di mana saja, kapan saja, lewat perangkat favoritmu.",
    icon: <Icon icon="mdi:laptop-chromebook" />,
  },
];

export const DEFAULT_CABANG_OPTIONS: CabangOption[] = [{ value: "semua", label: "Semua Cabang" }];