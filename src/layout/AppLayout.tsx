import { Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { SidebarProvider, useSidebar } from '../context/SidebarContext'
import { PublicRouteConstant } from '../constants/public_route';
import { useAuth } from '../context/AuthContext';
import { useAppSelector } from '../redux/redux-hook';
import { selectUtility } from '../redux/utility';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';
import AppHeader from './AppHeader';
import type {FC} from 'react';
import LoadingPage from '@/pages/Loading';


const LayoutContent: FC = () => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();
    const { isAuthenticated } = useAuth();
    const loadingScreen = useAppSelector(selectUtility).loading.screen;

    const navigate = useNavigate();

    useEffect(() => {
        const currenRoute = window.location.pathname;
        const isPublicPage = PublicRouteConstant.includes(currenRoute);
        if (!isAuthenticated && !isPublicPage) {
            navigate({ from: "/" })
        }
    })
    return  (
        <div className="min-h screen xl:flex">
            <LoadingPage />
            <div>
                <AppSidebar />
                <Backdrop />
            </div>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
                } ${isMobileOpen ? "ml-0" : ""} ${loadingScreen ? "animte-pulse" : ""}`}
            >
                <div className="p-4 mx-auto max-w(--breakpoint-2xl) md:p-6">
                    <AppHeader />
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

const AppLayout: FC = () => {
    return (
        <SidebarProvider>
            <LayoutContent />
        </SidebarProvider>
    );
};

export default AppLayout;