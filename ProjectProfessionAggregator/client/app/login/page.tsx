"use client"
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation'

import "@/app/form-register-login.css"

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() }); // Удаляем пробелы
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!formData.username || !formData.password) {
        throw new Error('Логин и пароль обязательны');
      }
      const res = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось войти.`);
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className='form-register-or-login'>
          <h1>Добро пожаловать</h1>
          {error && <p>{error}</p>}
          <div className="div-form-login-content">
              <div>
                  <label>Введите логин</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="логин" required></input>
              </div>
              <div>
                  <label>Введите пароль</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="пароль" required></input>
              </div>
              <button type="submit">Войти</button>
              <a href='/register'>Регистрация</a>
          </div>
      </form>
      <button className='btn-information'>i</button>
    </div>
  );
}
