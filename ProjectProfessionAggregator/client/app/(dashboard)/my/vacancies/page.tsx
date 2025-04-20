'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { VacancyDeteils } from '@/app/types/index.js';
import "../cart-view.css"

export default function VacanciesListPage() {
  const [vacancies, setData] = useState<VacancyDeteils[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует.');
        }

        const res = await fetch('http://localhost:8000/api/my/vacancies/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}: Не удалось загрузить вакансию.`);
        }

        const data = await res.json();
        setData(data);
      } catch (err: any) {
        if (err.message.includes('Токен') || err.message.includes('401')) {
          router.push('/login');
        }
      }
    };
    fetchCompanies();
  }, [router]);

  const handleEdit = (id: number) => {
    router.push(`/my/vacancies/edit/${id}`);
  };

  const handleView = (id: number) => {
    router.push(`/vacancies/view/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует.');
      }

      const res = await fetch(`http://localhost:8000/api/vacancies/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось удалить компанию.`);
      }

      setData(vacancies.filter((vacancies) => vacancies.id !== id));
      // setSuccess('Компания удалена!');
    } catch (err: any) {
      if (err.message.includes('Токен') || err.message.includes('401')) {
        router.push('/login');
      }
    }
  };
  return (
    <>
    {vacancies.length === 0 ? (
      <></>
    ) : (
      <div className="content">
        {vacancies.map((vacancies) => (
          <div key={vacancies.id} className="cart-view">
            <div className="cart-view-content-header">
              <h1>{vacancies.title}</h1>
              <p>От: {vacancies.salary}</p>
            </div>
            <div className="cart-view-content-footer">
              <a onClick={() => handleDelete(vacancies.id!)}>Удалить</a>
              <a onClick={() => handleEdit(vacancies.id!)}>Изменить</a>
              <a onClick={() => handleView(vacancies.id!)}>Посмотреть</a>
            </div>
          </div>
        ))}
      </div>
    )}
    </>
  );
}