"use client"
import { useState, useEffect } from 'react';
import { Vacancy, Company } from '@/app/types/index.js';
import { useRouter } from 'next/navigation'
import "../vacancies.css"

export default function AddVacancies() {
  const [formData, setFormData] = useState<Vacancy>({
    company: 0,
    title: '',
    JobTitle: '',
    salary: '',
    experience: '',
    graphy: '',
    watch: '',
    information: '',
    education_information: '',
    education_link: '',
    education: '1',
    selection: '1',
    category: '1',
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Токен авторизации отсутствует');
        const res = await fetch('http://localhost:8000/api/my/companies/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Не удалось загрузить компании');
        const data = await res.json();
        setCompanies(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, company: data[0].id }));
        } else {
          setError('У вас нет компаний. Создайте компанию перед добавлением вакансии.');
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'company' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
      }

      if (formData.company === 0 || !companies.some(c => c.id === formData.company)) {
        throw new Error('Пожалуйста, выберите действующую компанию.');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('company_id', formData.company.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('JobTitle', formData.JobTitle);
      formDataToSend.append('salary', formData.salary);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('graphy', formData.graphy);
      formDataToSend.append('watch', formData.watch);
      if(formData.information) formDataToSend.append('information', formData.information);
      if(formData.education_information) formDataToSend.append('education_information', formData.education_information);
      if(formData.education_link) formDataToSend.append('education_link', formData.education_link);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('selection', formData.selection);
      formDataToSend.append('category', formData.category);

      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const res = await fetch('http://localhost:8000/api/vacancies/add/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.log('Server error response:', errorData);
        if (res.status === 401) {
          router.push('/login');
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        }
        if (res.status === 403) {
          throw new Error(
            errorData.error || 'У вас нет прав для создания вакансии.'
          );
        }
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось создать вакансию.`);
      }

      router.push('/my/vacancies/');
    } catch (err: any) {
      setError(err.message);
      console.error('Add vacancy error:', err);
    }
  };

  return (
    <>
    <div className='str-left-right'>
    {error && <p className="text-red-500 mb-4">{error}</p>}
    <form onSubmit={handleSubmit} className='form-create-vacancies'>
      <h1>Форма добавление вакансии</h1>
      <div className="div-content">
      <div className='div-content_content'>
        <label htmlFor="getting_education_in_our_city">Выберите компанию</label>
        <select name="company" value={formData.company} onChange={handleChange} required>
        <option>--выбери---</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name_company}
          </option>
        ))}
        </select>
      </div>
      <div className='hr'/>
      <input type="text" name='title' value={formData.title} onChange={handleChange} placeholder="Название профессии" required/>
      <div className='hr'/>
      <input type="text" name='JobTitle' value={formData.JobTitle} onChange={handleChange} placeholder="Должность" required/>
      <div className='hr'/>
      <input type="text" name='salary' value={formData.salary} onChange={handleChange} placeholder="Зарплата"/>
      <div className='hr'/>
      <div className='div-content_content'>
        <label>Тип вакансии</label>
        <select name="selection" value={formData.selection} onChange={handleChange} required>
          <option value="1">Актуальные</option>
          <option value="2">Перспективные</option>
        </select>
      </div>
      <div className='hr'/>
      <div className='div-content_content'>
        <label htmlFor="education">Образование:</label>
        <select name="education" value={formData.education} onChange={handleChange}>
          <option value="1">Не требуется</option>
          <option value="2">Среднее</option>
          <option value="3">Высшее</option>
        </select>
      </div>
      <div className='hr'/>
      <div className='div-content_content'>
        <label htmlFor="category">Категория:</label>
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="1">Производство</option>
          <option value="2">Финансы</option>
          <option value="3">Образование</option>
        </select>
      </div>
      <div className='hr'/>
      <input type="text" name='experience' value={formData.experience} onChange={handleChange} placeholder="Опыт работы"/>
      <div className='hr'/>
      <input type="text" name='graphy' value={formData.graphy} onChange={handleChange} placeholder="График"/>
      <div className='hr'/>
      <input type="text" name='watch' value={formData.watch} onChange={handleChange} placeholder="Время работы"/>
      <div className='hr'/>
      <textarea name='information' value={formData.information} onChange={handleChange} placeholder="Информация"/>
      <div className='hr'/>
      <div className='hr'/>
      <textarea name="education_information" value={formData.education_information} onChange={handleChange} placeholder='Информация об образовательной организации'/>
      <div className='hr'/>
      <input type="url" name="education_link" value={formData.education_link} onChange={handleChange} placeholder='Ссылка на образование' />
      <div className='hr'/>
      <button type="submit" className='btn-accept_02'>Подвердить</button>
      </div>
    </form>
      {/* <div className="form">
        <h1>Форма компании</h1>
        <div className="company-details">
          <p>Название: {selectedCompany && ( selectedCompany.name_company )} </p>
          <div className='hr'/>
          <p>Почта: {selectedCompany && ( selectedCompany.email_company )}</p>
          <div className='hr'/>
          <p>Телефон: {selectedCompany && ( selectedCompany.phone_company )}</p>
          <div className='hr'/>
          <p>Адрес: {selectedCompany && ( selectedCompany.address_company )}</p>
        </div>
      </div> */}
    </div>
    </>
  );
}
