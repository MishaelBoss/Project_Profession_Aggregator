'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { UserTest } from '@/app/types/index.js';
import "./lsit-user.css"

export default function ListUsers() {
  const [users, setListUser] = useState<UserTest[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
        }

        const res = await fetch('http://localhost:8000/api/users/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Ошибка ${res.status}: Не удалось загрузить пользователей.`
          );
        }

        const data = await res.json();
        console.log('Users data:', data);
        setListUser(data);
      } catch (err: any) {
        console.error('Fetch users error:', err);
        if (err.message.includes('Токен') || err.message.includes('401')) {
          router.push('/login');
        }
      }
    };
    fetchUsers();
  }, [router]);

  const handleUpdate = async (userId: number, adminType: string, isStaff: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
      }

      const res = await fetch(`http://localhost:8000/api/users/${userId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_type: adminType, is_staff: isStaff }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Ошибка ${res.status}: Не удалось обновить пользователя.`
        );
      }

      const data = await res.json();
      setListUser(users.map((user) => (user.id === userId ? data : user)));
    } catch (err: any) {
      console.error('Update user error:', err);
    }
  };

  if (!users) {
    return (
      <div>
        <h1>Список пользователей</h1>
        <p>Загрузка...</p>
      </div>
    );
  }
  return (
    <div>
      {users.length === 0 ? (
          <></>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Логин</th>
              <th>Админ</th>
              <th>Тип</th>
              <th>Добавить админа</th>
            </tr>
          </thead>
          <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.is_staff ? 'Да' : 'Нет'}</td>
              <td>
                  <select value={user.admin_type} onChange={(e) => handleUpdate(user.id, e.target.value, user.is_staff)}>
                    <option value="super">Главный администратор</option>
                    <option value="employer">Работодатель</option>
                    <option value="none">Обычный пользователь</option>
                  </select>
              </td>
              <td><a href='' onClick={() => handleUpdate(user.id, user.admin_type, !user.is_staff)}>{user.is_staff ? 'Снять админку' : 'Назначить админку'}</a></td>
            </tr>
          ))}
          </tbody>
        </table>
        )}
    </div>
  );
}
