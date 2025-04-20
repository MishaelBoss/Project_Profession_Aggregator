'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Company } from '@/app/types/index.js';
import "../cart-view.css"
import Image from 'next/image'


export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует.');
        }

        const res = await fetch('http://localhost:8000/api/my/companies/', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}: Не удалось загрузить компании.`);
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
  }, [router]);

  const handleEdit = (companyId: number) => {
    router.push(`/my/company/edit/${companyId}`);
  };

  const handleView = (companyId: number) => {
    router.push(`/company/view/${companyId}`);
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

      setCompanies(companies.filter((company) => company.id !== companyId));
      // setSuccess('Компания удалена!');
    } catch (err: any) {
      if (err.message.includes('Токен') || err.message.includes('401')) {
        router.push('/login');
      }
    }
  };

  return (
    <>
    {companies.length === 0 ? (
      <></>
    ) : (
      <div className="content">
        {companies.map((company) => (
          <div key={company.id} className="cart-view">
            <div className="cart-view-content-header">
              <div>
              </div>
                <h1>Имя: {company.name_company}</h1>
                <p>Почта: {company.email_company || 'Не указана'}</p>
                <p>Телефон: {company.phone_company || 'Не указан'}</p>
                <p>Аддресс: {company.address_company || 'Не указан'}</p>
              </div>
              <div>
                <div>
                {company.image !== null && company.image !== undefined ? (
                    <Image
                      src={`http://localhost:8000${company.image}`}
                      alt="Лого компании"
                      width={128}
                      height={128}
                      // placeholder="blur"
                      // blurDataURL="/placeholder-image.png"
                      onError={() => console.error(`Failed to load image for ${company.name_company}`)}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            <div className="cart-view-content-footer">
              <a onClick={() => handleDelete(company.id!)}>Удалить</a>
              <a onClick={() => handleEdit(company.id!)}>Изменить</a>
              <a onClick={() => handleView(company.id!)}>Посмотреть</a>
            </div>
          </div>
        ))}
      </div>
    )}
    </>
  );
}
