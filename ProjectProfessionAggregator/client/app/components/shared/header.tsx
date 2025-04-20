'use client'
import Image from "next/image";
import { useEffect, useState } from 'react';
import "./header.css";
import { useRouter } from 'next/navigation'
import ImageLogoFromHeader from "@/public/atom.png"

interface Props{
    className?: string;
}

interface UserProfile {
    admin_type: string | null;
    is_superuser: boolean;
}

const menuItemsStatic = [
    { text: "Главная", href: "/" },
    { text: "Вакансии", href: "/vacancies" },
];

const menuItemsNotLogin = [
    { text: "Войти", href: "/login" },
];

const menuItemsLogin = [
    { text: "Профиль", href: "/profile" },
];

const menuAdminPanel = [
    { text: "Админ панель", href: "/admin" },
];

export const Header: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        const res = await fetch('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUserProfile({
            admin_type: data.admin_type || null,
            is_superuser: data.is_superuser || false,
          });
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  const showAdminPanel = userProfile && (
    userProfile.admin_type === 'employer' ||
    userProfile.admin_type === 'admin' ||
    userProfile.is_superuser
  );
  if (loading) {
    return <header className="header"><div className="Header-content">Загрузка...</div></header>;
  }
    
  return(
    <header className={`header ${className || ''}`}>
    <div className="Header-content">
      <div className="Header-content-left">
        <a href="/">
          <Image src={ImageLogoFromHeader} alt="Logo" width={35} height={35} />
        </a>
      </div>
      <div className="Header-content-right">
        {menuItemsStatic.map(({ text, href }, index) => (
          <a
            key={index}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              router.push(href, { scroll: false });
            }}
          >
            {text}
          </a>
        ))}
        {!isAuthenticated && menuItemsNotLogin.map(({ text, href }, index) => (
          <a
            key={index}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              router.push(href, { scroll: false });
            }}
          >
            {text}
          </a>
        ))}
        {isAuthenticated && menuItemsLogin.map(({ text, href }, index) => (
          <a
            key={index}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              router.push(href, { scroll: false });
            }}
          >
            {text}
          </a>
        ))}
        {isAuthenticated && showAdminPanel && menuAdminPanel.map(({ text, href }, index) => (
          <a
            key={index}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              router.push(href, { scroll: false });
            }}
          >
            {text}
          </a>
        ))}
      </div>
    </div>
  </header>
  );
}