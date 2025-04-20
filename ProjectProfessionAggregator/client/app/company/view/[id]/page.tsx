'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Company } from '@/app/types/index.js';
import "./company-view-information.css"

type Props = {
  params: Promise<{ id: string }>
}

export default function CompanyViewPage({ params }: Props) {
  const [company, setCompanies] = useState<Company | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует.');
        }

        const companyId = (await params).id;
        const res = await fetch(`http://localhost:8000/api/company/${companyId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Ошибка ${res.status}: Не удалось загрузить компанию или ее нету.`
          );
        }

        const data = await res.json();
        setCompanies(data);
      } catch (err: any) {
        if (err.message.includes('Токен') || err.message.includes('401')) {
          router.push('/login');
        }
      }
    };
    fetchCompanies();
  }, [router, params]);

  const handleEdit = (companyId: number) => {
    router.push(`/my/company/edit/${companyId}`);
  };
  
  const handleDelete = async (companyId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту компанию?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует.');
      }

      const res = await fetch(`http://localhost:8000/api/company/${companyId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось удалить компанию.`);
      }
      // setSuccess('Компания удалена!');
    } catch (err: any) {
      if (err.message.includes('Токен') || err.message.includes('401')) {
        router.push('/login');
      }
    }
  };

  if (!company) {
    return (
      <div className="div-view-company">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <>
    <div className="content">
      <div key={company.id} className="cart-view">
        <div className="cart-view-content-header">
          <h1>Имя: {company.name_company}</h1>
          <p>Почта: {company.email_company || 'Не указана'}</p>
          <p>Телефон: {company.phone_company || 'Не указан'}</p>
          <p>Аддресс: {company.address_company || 'Не указан'}</p>
        </div>
      </div>
    </div>
    </>
  );
}
