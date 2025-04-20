'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { VacancyMember } from '@/app/types/index.js';
import "./lsit-user.css"

type Props = {
  params: Promise<{ id: string }>;
};

export default function ListUsersvacanciesPage({ params }: Props) {
  const [members, setMembers] = useState<VacancyMember[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const id = (await params).id;
        const res = await fetch(`http://localhost:8000/api/vacancies/${id}/user-list/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}: Не удалось загрузить участников.`);
        }

        const data = await res.json();
        const membersData = data.members || [];
        setMembers(membersData);
      } catch (err: any) {
        console.error('Fetch members error:', err);
        if (err.message.includes('401')) {
          router.push('/login');
        }
      }
    };
    fetchMembers();
  }, [params, router]);

  const handleRemove = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите исключить этого пользователя?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const id = (await params).id;
      const res = await fetch(`http://localhost:8000/api/vacancies/${id}/members/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось исключить пользователя.`);
      }

      setMembers(members.filter((member) => member.id !== userId));
    } catch (err: any) {
      console.error('Remove member error:', err);
      if (err.message.includes('401') || err.message.includes('403')) {
        router.push('/login');
      }
    }
  };

  // const handleViewProfile = (userId: number) => {
  //   router.push(`/profile/${userId}`);
  // };

  return (
    <div className="div-content">
    <h1>Участники вакансии</h1>
    {members.length === 0 ? (
      <p>Участники отсутствуют</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Логин</th>
            <th>Почта</th>
            <th>Действие</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.username}</td>
              <td>{member.email}</td>
              <td>
                <button
                  onClick={() => handleRemove(member.id)}
                  className="text-red-600 hover:underline"
                >
                  Исключить
                </button>
              </td>
              <td>
                {/* <button
                  onClick={() => handleViewProfile(member.id)}
                  className="text-blue-600 hover:underline"
                >
                  Посмотреть профиль
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
  );
}
