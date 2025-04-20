"use client"
import { useState } from 'react';
import { Company } from '@/app/types/index.js';
import { useRouter } from 'next/navigation'
import "../company.css"

export default function AddCompany() {
  const [formData, setFormData] = useState<Company>({
    name_company: '',
    email_company: '',
    phone_company: '',
    address_company: '',
    image: null,
  });
  const [error, setError] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const handleChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: name === 'company' ? Number(value) : value }));
  // };


const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('name_company', formData.name_company.toString());
      formDataToSend.append('email_company', formData.email_company.toString());
      formDataToSend.append('phone_company', formData.phone_company.toString());
      formDataToSend.append('address_company', formData.address_company.toString());
      if (formData.image) formDataToSend.append('image', formData.image);
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      const res = await fetch('http://localhost:8000/api/company/add/', {
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
            errorData.error || 'У вас нет прав для создания компании.'
          );
        }
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось создать компанию.`);
      }
      router.push('/my/company/');
    } catch (err: any) {
      setError(err.message);
      console.error('Add company error:', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='form-create'>
        <h1>Форма добавление компании</h1>
        <div className="div-content">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className='hr'/>
          <input type="text" name='name_company' value={formData.name_company} onChange={handleChange} placeholder="Название компании" required/>
          <div className='hr'/>
          <input type="email" name='email_company' value={formData.email_company} onChange={handleChange} placeholder="Почта компании" required/>
          <div className='hr'/>
          <input type="text" name='phone_company' value={formData.phone_company} onChange={handleChange} placeholder="Телефон компании"/>
          <div className='hr'/>
          <input type="text" name='address_company' value={formData.address_company} onChange={handleChange} placeholder="Аддресс компании"/>
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
          <button type="submit">Подвердить</button>
        </div>
      </form>
    </div>
  );
}
