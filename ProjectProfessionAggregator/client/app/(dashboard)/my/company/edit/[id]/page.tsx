'use client'
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'
import { Company } from '@/app/types/index.js';
import "../../company.css"

export default function CompanyEditPage() {
  const [formData, setFormData] = useState<Company>({
    id: 0,
    name_company: '',
    email_company: '',
    phone_company: '',
    address_company: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
        }

        const res = await fetch(`http://localhost:8000/api/company/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            `Ошибка ${res.status}: ${
              errorData.error || res.statusText || 'Неизвестная ошибка'
            }`
          );
        }

        const data = await res.json();
        setFormData(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Fetch company error:', err);
        if (err.message.includes('Токен') || err.message.includes('401')) {
          router.push('/login');
        }
      }
    };
    fetchCompany();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
      }

      console.log('Updating company data:', formData);

      const res = await fetch(`http://localhost:8000/api/company/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage =
          errorData.name_company?.[0] ||
          errorData.email_company?.[0] ||
          errorData.error ||
          `Ошибка ${res.status}: Неизвестная ошибка`;
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setSuccess('Компания успешно обновлена! Перенаправление...');
      console.log('Company updated:', data);
      setTimeout(() => router.push('my/company/'), 2000);
    } catch (err: any) {
      setError(err.message);
      console.error('Update company error:', err);
      if (err.message.includes('Токен') || err.message.includes('401')) {
        router.push('/login');
      }
    }
  };
  return (
    <>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className='form-create'>
        <h1>Редактировать компанию</h1>
        <div className="div-content">
          <div className='hr'/>
          <input type="text" name='name_company' value={formData.name_company} onChange={handleChange} placeholder="Название компании" required/>
          <div className='hr'/>
          <input type="text" name='email_company' value={formData.email_company} onChange={handleChange} placeholder="Почта компании" required/>
          <div className='hr'/>
          <input type="text" name='phone_company' value={formData.phone_company} onChange={handleChange} placeholder="Телефон компании"/>
          <div className='hr'/>
          <input type="text" name='address_company' value={formData.address_company} onChange={handleChange} placeholder="Аддресс компании"/>
          <div className='hr'/>
          <button type="submit">Подвердить</button>
        </div>
      </form>
    </>
  );
}
