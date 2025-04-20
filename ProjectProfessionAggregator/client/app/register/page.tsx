"use client"
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { RegisterFormData } from '@/app/types/index.js';
import { useRouter } from 'next/navigation'
import "@/app/form-register-login.css"

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    name: '',
    surname: '',
    patronymic: '',
    phone: '',
    about: '',
    years: '',
    experience: '',
  });
  const [error, setError] = useState<string>('');
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Не удалось зарегистрироваться.');
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      setError('');
      router.push('/profile')
    } catch (err: any) {
      setError(err.message || 'Не удалось зарегистрироваться.');
      console.error('Registration error:', err);
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className='form-register-or-login'>
        <h1>Зарегистрироваться на сайт</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="div-form-login-content">
          <div>
              <label>Введите логин</label>
              <input type="text" minLength={4} name="username" placeholder="логин < 4 симвл" value={formData.username} onChange={handleChange}></input>
          </div>
          <div>
              <label>Введите почту</label>
              <input type="text" minLength={4} name="email" placeholder="почта < 4 симвл" value={formData.email} onChange={handleChange}></input>
          </div>
          <div>
              <label>Имя</label>
              <input type="text" minLength={4} name="name" placeholder="имя < 4 симвл" value={formData.name} onChange={handleChange}></input>
          </div>
          <div>
              <label>Фамилия</label>
              <input type="text" minLength={4} name="surname" placeholder="фамилия < 4 симвл" value={formData.surname} onChange={handleChange}></input>
          </div>
          <div>
              <label>Отчество</label>
              <input type="text" minLength={4} name="patronymic" placeholder="отчество < 4 симвл" value={formData.patronymic} onChange={handleChange}></input>
          </div>
          <div>
              <label>Номер телефона</label>
              <input type="tel" minLength={4} name="phone" placeholder="телефон < 4 симвл" value={formData.phone} onChange={handleChange}></input>
          </div>
          <div>
              <label>Сколько лет</label>
              <input type="text" minLength={1} name="years" placeholder="лет < 1 симвл" value={formData.years} onChange={handleChange}></input>
          </div>
          <div>
              <label>Сколько лет стажа работы</label>
              <input type="text" name="experience" placeholder="стаж" value={formData.experience} onChange={handleChange}></input>
          </div>
          <div>
            <label>Сколько лет стажа работы</label>
            <textarea name="about" value={formData.about} onChange={handleChange} placeholder="Публичная информация обо мне"/>
          </div>
          <div>
              <label>Введите пароль</label>
              <input type="password" name="password" placeholder="пароль" value={formData.password} onChange={handleChange}></input>
          </div>
          <button type="submit">Зарегистрироваться</button>
          <a href='/login'>Войти</a>
        </div>
      </form>
    </div>
  );
}
