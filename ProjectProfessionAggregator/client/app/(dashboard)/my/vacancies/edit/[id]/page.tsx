'use client'
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'
import { Vacancy, Company } from '@/app/types/index.js';
import "../../vacancies.css"

export default function VacanciesEditPage() {
  const [formData, setFormData] = useState<Vacancy>({
    company: 0,
    title: '',
    JobTitle: '',
    salary: '',
    experience: '',
    graphy: '',
    watch: '',
    information: '',
    image: null,
    education_information: '',
    education_link: '',
    education: '1',
    selection: '1',
    category: '1',
  });
  const router = useRouter();
  const params = useParams();
  const vacancyId = Number(params.id);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
      } catch (err: any) {
        console.error('Fetch companies error:', err.message);
      }
    };

    const fetchVacancy = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Токен авторизации отсутствует');
        const res = await fetch(`http://localhost:8000/api/vacancies/${vacancyId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Не удалось загрузить вакансию');
        const data = await res.json();
        setFormData({
          company: data.company.id,
          title: data.title,
          JobTitle: data.JobTitle,
          salary: data.salary,
          experience: data.experience,
          graphy: data.graphy,
          watch: data.watch,
          information: data.information || '',
          image: data.image || null,
          education_information: data.education_information || '',
          education_link: data.education_link || '',
          education: data.education,
          selection: data.selection,
          category: data.category,
        });
        if (data.image) setImagePreview(`http://localhost:8000${data.image}`);
      } catch (err: any) {
        console.error('Fetch vacancy error:', err.message);
      }
    };

    fetchCompanies();
    fetchVacancy();
  }, [vacancyId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev: any) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
      }

      if (formData.company === 0) {
        throw new Error('Пожалуйста, выберите компанию.');
      }
      if (!formData.title || !formData.JobTitle || !formData.salary) {
        throw new Error('Пожалуйста, заполните все обязательные поля: Название, Должность, Зарплата.');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('company_id', formData.company.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('JobTitle', formData.JobTitle);
      formDataToSend.append('salary', formData.salary);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('graphy', formData.graphy);
      formDataToSend.append('watch', formData.watch);
      if (formData.information) formDataToSend.append('information', formData.information);
      if (formData.image instanceof File) formDataToSend.append('image', formData.image);
      if (formData.education_information)
        formDataToSend.append('education_information', formData.education_information);
      if (formData.education_link) formDataToSend.append('education_link', formData.education_link);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('selection', formData.selection);
      formDataToSend.append('category', formData.category);

      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const res = await fetch(`http://localhost:8000/api/vacancies/${vacancyId}/`, {
        method: 'PUT',
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
            errorData.error || 'У вас нет прав для редактирования вакансии.'
          );
        }
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось обновить вакансию.`);
      }

      router.push('my/vacancies/');
    } catch (err: any) {
      console.error('Edit vacancy error:', err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if(!loading){
    return (
      <div>
        <h1>Идет загрузка</h1>
      </div>
    )
  }
  
  return (
    <div className='str-left-right'>
      <form onSubmit={handleSubmit} className='form-create-vacancies'>
        <h1>Форма изменение вакансии</h1>
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
        <input type="text" name='title' value={formData.title} onChange={handleChange} placeholder="Название вакансии" required/>
        <div className='hr'/>
        <input type="text" name='JobTitle' value={formData.JobTitle} onChange={handleChange} placeholder="Должность" required/>
        <div className='hr'/>
        <input type="text" name='salary' value={formData.salary} onChange={handleChange} placeholder="Зарплата" required/>
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
        <div>
          <label className="block text-gray-700">Логотип компании</label>
          <input type="file" name="image" accept="image/*" onChange={handleFileChange} className="w-full border rounded-md p-2" />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
              <button type="button" onClick={handleRemoveImage} className="mt-2 text-red-500 hover:underline"> Удалить изображение</button>
            </div>
          )}
        </div>
        <div className='hr'/>
        <textarea name="education_information" value={formData.education_information} onChange={handleChange} placeholder="Информация об образовательной организации"/>
        <div className='hr'/>
        <input type="url" name="education_link" value={formData.education_link} onChange={handleChange} className="w-full border rounded-md p-2" placeholder="Ссылка на образование"/>
        <div className='hr'/>
        <button type="submit">Подвердить</button>
        </div>
      </form>
    </div>
  );
}
