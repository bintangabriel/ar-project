'use client'
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '../../redux/store';

const PUBLIC_ROUTES = ['/login'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

    const isPublic = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        if (!isAuthenticated && !isPublic) {
            router.replace('/login');
        }
    }, [isAuthenticated, isPublic, router]);

    if (!isAuthenticated && !isPublic) return null; // avoid flashing protected content

    return <>{children}</>;
}