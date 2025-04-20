"use client"
import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { UserProfileData } from '@/app/types/index.js';
import { useRouter } from 'next/navigation'
import "./vacancies.css"

type Props = {
  params: Promise<{ id: string }>
}

export default function Edit_Profile() {
  const [formData, setProfile] = useState<UserProfileData>({
    username: '',
    email: '',
    name: '',
    surname: '',
    patronymic: '',
    phone: '',
    about: '',
    years: '',
    experience: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Не удалось загрузить данные профиля.');
        }

        const data = await res.json();
        setProfile({
          username: data.username || '',
          email: data.email || '',
          name: data.profile.name || '',
          surname: data.profile.surname || '',
          patronymic: data.profile.patronymic || '',
          phone: data.profile.phone || '',
          about: data.profile.about || '',
          years: data.profile.years || '',
          experience: data.profile.experience || '',
          password: '',
        });
      } catch (err: any) {
        setError(err.message);
        console.error('Fetch profile error:', err);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось обновить профиль.`);
      }

      const data = await res.json();
      setProfile({
        username: data.user.username || '',
        email: data.user.email || '',
        name: data.profile.name || '',
        surname: data.profile.surname || '',
        patronymic: data.profile.patronymic || '',
        phone: data.profile.phone || '',
        about: data.profile.about || '',
        years: data.profile.years || '',
        experience: data.profile.experience || '',
        password: '',
      });
      setSuccess('Профиль успешно обновлён. Проверьте почту для подтверждения изменений.');
      setError('');
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess('');
      console.error('Edit profile update error:', err);
    }
  };
  return (
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form className="form-create-vacancies" onSubmit={handleSubmit}>
        <div className="div-content">
          <input type="text" name="username" value={formData.username} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="логин"/>
          <div className='hr'/>
          <input type="email" name="email" value={formData.email} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="почта"/>
          <div className='hr'/>
          <input type="password" name="password" value={formData.password} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="пароль"/>
          <div className='hr'/>
          <input type="text" name="name" value={formData.name} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="имя"/>
          <div className='hr'/>
          <input type="text" name="surname" value={formData.surname} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="фамилия"/>
          <div className='hr'/>
          <input type="text" name="patronymic" value={formData.patronymic} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="отчество"/>
          <div className='hr'/>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="пароль"/>
          <div className='hr'/>
          <textarea name="about" value={formData.about} onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>} placeholder="Публичная информация обо мне"/>
          <div className='hr'/>
          <input type="text" name="years" value={formData.years} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="лет"/>
          <div className='hr'/>
          <input type="text" name="experience" value={formData.experience} onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>} placeholder="мой стаж"/>
          <div className='hr'/>
          <button type="submit">Подвердить</button>
        </div>
      </form>
    </div>
  );
}
