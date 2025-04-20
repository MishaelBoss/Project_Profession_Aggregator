from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterAPI, LoginAPI, LogoutAPI, ProfileAPI, AddVacanciesAPI, CompaniesListAPI, CompanyAPI, VacanciesListAPI, UserManagementAPI, VacancyApplyAPI, VacancyMemberRemoveAPI, MyCompaniesAPI, MyVacanciesAPI, VacancyMembersExportAPI, VacancyMembersListAPI

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('api/profile/', ProfileAPI.as_view(), name='profile'),
    path('api/users/', UserManagementAPI.as_view(), name='user_list'),
    path('api/users/<int:user_id>/', UserManagementAPI.as_view(), name='user_detail'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/company/add/', CompanyAPI.as_view(), name='add_company'),
    path('api/company/<int:company_id>/', CompanyAPI.as_view(), name='company_detail'),
    path('api/companies/', CompaniesListAPI.as_view(), name='companies_list'),
    path('api/vacancies/add/', AddVacanciesAPI.as_view(), name='add_vacancies'),
    path('api/vacancies/<int:id>/', AddVacanciesAPI.as_view(), name='vacancies_detail'),
    path('api/vacancies/', VacanciesListAPI.as_view(), name='vacancies_list'),
    path('api/vacancies/<int:id>/apply/', VacancyApplyAPI.as_view(), name='vacancy-apply'),
    path('api/vacancies/<int:vacancy_id>/user-list/', VacancyMembersListAPI.as_view(), name='vacancy-members-list'),
    path('api/vacancies/<int:id>/members/<int:user_id>/', VacancyMemberRemoveAPI.as_view(), name='vacancy-member-remove'),
    path('api/vacancies/<int:vacancy_id>/members/export/', VacancyMembersExportAPI.as_view(), name='vacancy-members-export'),
    path('api/my/companies/', MyCompaniesAPI.as_view(), name='my_companies'),
    path('api/my/vacancies/', MyVacanciesAPI.as_view(), name='my_vacancies'),
]