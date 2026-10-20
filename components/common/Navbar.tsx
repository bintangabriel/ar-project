'use client'
import React, { useState } from 'react';
import { Menu, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { getNavbarData, getProfile } from '../../config/data';
import { useAppDispatch, useAppSelector, useUserData } from '../../redux/store';
import Link from 'next/link';
import { logout } from '../../redux/UserSlice';
const Navbar: React.FC = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const user = useUserData()?.user;
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

    const handleLogout = async () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie = "token=; Max-Age=0; path=/;";
        dispatch(logout());
    };

    const navbarData = getNavbarData(isAuthenticated);
    const profileData = getProfile(user, handleLogout);

    return (
        <nav className="fixed top-0 z-50 w-full bg-white shadow-md px-8 py-2 flex justify-between items-center">

            {/* Logo */}
            <div className="text-xl font-bold text-orange-500">
                <img
                              src="/img/arise.jpeg"
                              alt="AR Illustration"
                              width={100}
                              height={100}
                              className="object-contain drop-shadow-xl"
                            />
            </div>

            {/* Desktop Menu */}
            <Menu
                mode="horizontal"
                items={navbarData}
                selectable={false}
                className="!border-none !hidden sm:!flex gap-3 !justify-center 
                !items-center flex-1 min-w-0 after:!border-b-0"
            />

            {isAuthenticated ?
                (< Menu
                    mode="horizontal"
                    items={profileData}
                    selectable={false}
                    style={{ minWidth: '150px' }}
                    className="!border-none !hidden sm:!flex !items-center min-w-28"
                />) :
                (
                    <Link href="/login" prefetch={false}>
                        <Button className='hover:!text-gray-700 hover:!bg-gray-100 hover:!border-gray-700'>
                            Login
                        </Button>
                    </Link>
                )
            }

            {/* Mobile Hamburger Button */}
            <div className="sm:hidden">
                <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setOpenDrawer(true)}
                />
            </div>

            {/* Mobile Drawer */}
            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
                style={{ padding: 0 }}
            >
                <Menu
                    mode="inline"
                    items={navbarData}
                    selectable={false}
                />
                <Menu
                    mode="inline"
                    items={profileData}
                    selectable={false}
                />
            </Drawer>
        </nav>
    );
};

export default Navbar;
