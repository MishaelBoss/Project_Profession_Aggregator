'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { VacancyDeteils } from '@/app/types/index.js';
import './vacancies.css'
import './vacancies-cart.css'

export default function VacanciesListAllViewPage() {
  const [vacancies, setData] = useState<VacancyDeteils[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [salaryFilter, setSalaryFilter] = useState<string>('');
  const [selectionFilter, setSelectionFilter] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const headers: HeadersInit = {};
        const token = localStorage.getItem('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('http://localhost:8000/api/vacancies/', {
          headers,
        });

        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}: Не удалось загрузить вакансии.`);
        }

        const data = await res.json();
        setData(data);
      } catch (err: any) {
        console.error('Fetch vacancies error:', err);
      }
    };
    fetchVacancies();
  }, []);

  const handleView = (id: number) => {
    router.push(`/vacancies/${id}`);
  };

  const handleSubmitAnApplication = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

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

    } catch (err: any) {
      console.error('Apply error:', err);
      if (err.message.includes('401')) {
        router.push('/login');
      }
    }
  };

  const handleExportMembers = async (vacancyId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        throw new Error('Требуется авторизация');
      }

      console.log('Export members request for vacancy:', vacancyId);

      const res = await fetch(`http://localhost:8000/api/vacancies/${vacancyId}/members/export/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.log('Server error response:', errorData);
        if (res.status === 401) {
          router.push('/login');
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        }
        if (res.status === 403) {
          throw new Error(errorData.error || 'У вас нет прав для скачивания списка участников');
        }
        if (res.status === 404) {
          throw new Error(errorData.error || 'Вакансия не найдена');
        }
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось скачать список`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vacancy_${vacancyId}_members.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log('Members exported for vacancy:', vacancyId);
    } catch (err: any) {
      console.error('Export error:', err);
    }
  };

  // const filteredVacancies = vacancies.filter((vacancy) =>
  //   vacancy.title.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const parseSalary = (salary: string): number => {
    const cleanSalary = salary.replace(/[^0-9]/g, '');
    return parseInt(cleanSalary) || 0;
  };

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesTitle = vacancy.title.toLowerCase().includes(searchQuery.toLowerCase());
    const salaryValue = parseSalary(vacancy.salary);
    const minSalary = salaryFilter ? parseInt(salaryFilter) || 0 : 0;
    const matchesSalary = minSalary === 0 || salaryValue >= minSalary;
    const matchesSelection = !selectionFilter || vacancy.selection === selectionFilter;
    return matchesTitle && matchesSalary && matchesSelection;
  });

  return (
    <>
    <header className='header__vacancies'>
      <div className='filtres'>
        <input type="text" placeholder="Название профессии" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        <div className='hr'/>
        <input type="number" placeholder="Зарплата от" value={salaryFilter} onChange={(e) => setSalaryFilter(e.target.value)} min="0"/>
        <div className='hr'/>
        <select value={selectionFilter} onChange={(e) => setSelectionFilter(e.target.value)}>
          <option value="">Все типы</option>
          <option value="1">Актуальные</option>
          <option value="2">Перспективные</option>
        </select>
      </div>
    </header>
    <main>
        {filteredVacancies.length === 0 ? (
          <div className='NotFound'>
            <p>Вакансии не найдены</p>
          </div>
        ) : (
          <div className="content">
            {filteredVacancies.map((vacancy) => (
              <div key={vacancy.id} className="cart-view">
                <div className='div-view-content-fixed'>
                <div className='div-view-content-left'>
                <div className="cart-view-content-header">
                  <h1>{vacancy.title}</h1>
                  <p>От: {vacancy.salary}</p>
                  <p>Опыт работы: {vacancy.experience}</p>
                  <p>
                    Категория: {
                      vacancy.category === "1" ? "Производство" :
                      vacancy.category === "2" ? "Финансы" :
                      vacancy.category === "3" ? "Образование" : "Неизвестно"
                    }
                  </p>
                  <p>
                    Тип: {
                      vacancy.selection === "1" ? "Актуальные" :
                      vacancy.selection === "2" ? "Перспективные" : "Неизвестно"
                    }
                  </p>
                </div>
                </div>
                <div className='div-view-content-right'>
                {vacancy.company_details.image !== null && vacancy.company_details.image !== undefined ? (
                    <Image
                      src={`http://localhost:8000${vacancy.company_details.image}`}
                      alt="Лого компании"
                      width={128}
                      height={128}
                      // placeholder="blur"
                      // blurDataURL="/placeholder-image.png"
                      onError={() => console.error(`Failed to load image for ${vacancy.company_details.name_company}`)}
                    />
                  ) : (
                    <></>
                  )}
                </div>
                </div>
                <div className="cart-view-content-footer">
                  <a onClick={() => handleView(vacancy.id!)}>Посмотреть</a>
                  <a onClick={() => handleSubmitAnApplication(vacancy.id!)}>Подать заявку</a>
                  <button onClick={() => handleExportMembers(vacancy.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Скачать участников</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
