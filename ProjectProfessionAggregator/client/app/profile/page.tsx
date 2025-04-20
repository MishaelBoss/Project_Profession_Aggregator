'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/app/types/index.js';
import "./admin.css"

type Props = {
  params: Promise<{ id: string }>
}

export default function Profile({ params }: Props) {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');

        const res = await fetch('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUserData({
          username: data.username || '',
          email: data.email || '',
          profile: {
            name: (data.profile && data.profile.name) || '',
            surname: (data.profile && data.profile.surname) || '',
            patronymic: (data.profile && data.profile.patronymic) || '',
            phone: (data.profile && data.profile.phone) || '',
            about: (data.profile && data.profile.about) || '',
            years: (data.profile && data.profile.years) || '',
            experience: (data.profile && data.profile.experience) || '',
          },
        });
      } catch (err: any) {
        const errorMessage = err.message || 'Не удалось загрузить профиль.';
        setError(errorMessage);
        if (err.message.includes('Токен') || err.message.includes('401')) {
          router.push('/login');
        }
      }
    };
    fetchProfile();
  }, [router]);

  if (!userData) {
    return (
      <div>
        <h1>Личный кабинет</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p>Загрузка...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/login');
    } catch (err: any) {
      console.error('Logout failed:', err);
    }
  };
  return (
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="profile">
        <div className="profile-content">
          <h1>Логин: {userData.username}</h1>
          <h1>Имя: {userData.profile.name || 'Не указано'}</h1>
          <h1>Фамилия: {userData.profile.surname || 'Не указано'}</h1>
          <h1>Отчество: {userData.profile.patronymic || 'Не указано'}</h1>
          <h1>Номер телефона: {userData.profile.phone || 'Не указано'}</h1>
          <h1>Почта: {userData.email || 'Не указано'}</h1>
          <h1>Лет: {userData.profile.years || 'Не указано'}</h1>
          <h1>Стаж работы: {userData.profile.experience || 'Не указано'}</h1>
        </div>
      </div>
      <div className="profile">
        <div className="profile-content">
          <h1>Общий просмотр</h1>
          <p>{userData.profile.about || 'Не указано'}</p>
        </div>
      </div>
      <div className="profile">
        <div className="profile-content-a">
          <a onClick={() => router.push('./profile/edit', { scroll: false })} style={{ width: '300px', height: '50px' }}>Редактировать аккаунт</a>
          <a onClick={handleLogout} style={{ color: 'red', width: '300px', height: '50px' }}>Выйти из аккаунта</a>
        </div>
      </div>
    </div>
  );
}
