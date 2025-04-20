'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VacancyDeteils } from '@/app/types/index.js';
import '../vacancies.css';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ListViewVacancies({ params }: Props) {
  const [vacancy, setData] = useState<VacancyDeteils | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const headers: HeadersInit = {};
        const token = localStorage.getItem('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const id = (await params).id;
        const res = await fetch(`http://localhost:8000/api/vacancies/${id}/`, {
          headers,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Ошибка ${res.status}: Не удалось загрузить вакансию или её нет.`
          );
        }

        const data = await res.json();
        console.log('API Response:', data);
        setData(data);
      } catch (err: any) {
        console.error('Fetch vacancy error:', err);
      }
    };
    fetchVacancy();
  }, [params]);

  const handleSubmitAnApplication = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const id = (await params).id;
      const res = await fetch(`http://localhost:8000/api/vacancies/${id}/apply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось подать заявку.`);
      }

      alert('Заявка успешно подана!');
    } catch (err: any) {
      console.error('Apply error:', err);
      if (err.message.includes('401')) {
        router.push('/login');
      }
      alert(err.message);
    }
  };

  const handleOpenListUser = async () => {
    const id = (await params).id;
    router.push(`/vacancies/${id}/list-user/`);
  };

  if (!vacancy) {
    return (
      <div className="div-view-company">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <div className="div-view-company">
        <div className="div-view-company-content">
          <div className="div-view-company-content-header">
            <div className="hr" />
            <span>Вакансия: {vacancy.title}</span>
            <div className="hr" />
            <p>Должность: {vacancy.JobTitle}</p>
            <div className="hr" />
            <h1>от {vacancy.salary}</h1>
            <div className="hr" />
            <p>Компания: {vacancy.company_details?.name_company || 'Не указана'}</p>
            <div className="hr" />
            <p>Опыт работы: {vacancy.experience}</p>
            <div className="hr" />
            <p>График: {vacancy.graphy}</p>
            <div className="hr" />
            <p>Рабочие часы: {vacancy.watch}</p>
            <div className="hr" />
            <p>
              Образование:{' '}
              {vacancy.education === '1'
                ? 'Высшее'
                : vacancy.education === '2'
                ? 'Среднее'
                : vacancy.education === '3'
                ? 'Без образования'
                : 'Не указано'}
            </p>
            <div className="hr" />
            <p>
              Тип вакансии:{' '}
              {vacancy.selection === '1'
                ? 'Актуальные'
                : vacancy.selection === '2'
                ? 'Перспективные'
                : 'Не указано'}
            </p>
            <div className="hr" />
            <p>
              Категория:{' '}
              {vacancy.category === '1'
                ? 'Производство'
                : vacancy.category === '2'
                ? 'Финансы'
                : vacancy.category === '3'
                ? 'Образование'
                : 'Не указано'}
            </p>
          </div>
          <div className="div-view-company-content-footer">
            <a onClick={() => handleSubmitAnApplication()} className="button-accept-vacancies">
              Подать заявку
            </a>
            <a onClick={() => handleOpenListUser()} className="button-accept-vacancies-view-user">
              Посмотреть участников
            </a>
          </div>
        </div>
      </div>
      <div className="div-view-company">
        <div className="div-view-company-title">
          <h1>Связаться с нами</h1>
        </div>
        <div className="div-view-company-content">
          <h1>Компания: {vacancy.company_details?.name_company || 'Не указана'}</h1>
          <h1>Почта: {vacancy.company_details?.email_company || 'Не указана'}</h1>
          <h1>Телефон: {vacancy.company_details?.phone_company || 'Не указан'}</h1>
          <h1>Адрес: {vacancy.company_details?.address_company || 'Не указан'}</h1>
        </div>
      </div>
      {(vacancy.education_information || vacancy.education_link) && (
        <div className="div-view-company">
          <div className="div-view-company-title">
            <h1>Информация об образовательных учреждениях</h1>
          </div>
          <div className="div-view-company-content">
            <h1>Информация: {vacancy.education_information || 'Не указана'}</h1>
            {vacancy.education_link && (
              <p>
                Ссылка на образование:{' '}
                <a href={vacancy.education_link} target="_blank" rel="noopener noreferrer">
                  {vacancy.education_link}
                </a>
              </p>
            )}
          </div>
        </div>
      )}
      {vacancy.information && (
        <div className="div-view-company">
          <div className="div-view-company-title">
            <h1>Дополнительная информация</h1>
          </div>
          <div className="div-view-company-content">
            <p>{vacancy.information}</p>
          </div>
        </div>
      )}
    </>
  );
}