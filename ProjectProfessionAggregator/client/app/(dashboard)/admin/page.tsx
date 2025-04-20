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
        if (!token) {
          router.push('/login');
        }

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
        <h1>Админ кабинет</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p>Загрузка...</p>
      </div>
    );
  }
  return (
    <div>
      <div className="profile">
        <div className="profile-content-a">
          <a onClick={() => router.push('/admin/list-user/', { scroll: false })} style={{ width: '300px', height: '50px' }}>Открыть весь список пользователей</a>
          <a onClick={() => router.push('/my/vacancies/add/', { scroll: false })} style={{ width: '300px', height: '50px' }}>Добавить вакансию</a>
          <a onClick={() => router.push('/my/company/add/', { scroll: false })} style={{ width: '300px', height: '50px' }}>Добавить компанию</a>
          <a onClick={() => router.push('/my/company', { scroll: false })} style={{ width: '300px', height: '50px' }}>Список моих компаний</a>
          <a onClick={() => router.push('/my/vacancies', { scroll: false })} style={{ width: '300px', height: '50px' }}>Список моих вакансий</a>
        </div>
      </div>
    </div>
  );
}
