from django.db import models
from django.contrib.auth.models import User
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    name = models.CharField(max_length=100, null=True, blank=True)
    surname = models.CharField(max_length=100, null=True, blank=True)
    patronymic = models.CharField(max_length=100, null=True, blank=True)
    phone = models.TextField(blank=True)
    about = models.TextField(blank=True)
    years = models.CharField(max_length=100, blank=True)
    experience = models.CharField(max_length=100, blank=True)
    ADMIN_TYPES = [
        ('super', 'Главный администратор'),
        ('employer', 'Работодатель'),
        ('none', 'Обычный пользователь'),
    ]
    admin_type = models.CharField(max_length=10, choices=ADMIN_TYPES, default='none')

    def __str__(self):
        return f'UserProfile {self.user.username} ({self.id})'
    
class Company(models.Model):
    name_company = models.CharField(max_length=100, blank=True)
    email_company = models.CharField(max_length=100, blank=True)
    phone_company = models.TextField(blank=True)
    address_company =  models.TextField(blank=True)
    image = models.ImageField(upload_to='company_images/', blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_companies')

    def __str__(self):
        return f'Company {self.name_company} ({self.id})'
    
class Vacancies(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='vacancies')
    title = models.CharField(max_length=100)
    JobTitle = models.CharField(max_length=100)
    salary = models.CharField(max_length=100)
    experience = models.CharField(max_length=100)
    graphy = models.CharField(max_length=100)
    watch = models.CharField(max_length=100)
    information = models.TextField(blank=True)
    education_information = models.TextField(blank=True)
    education_link = models.TextField(blank=True)
    EDUCATION_CHOICES = [
        ('1', 'Не требуется'),
        ('2', 'Среднее'),
        ('3', 'Высшее'),
    ]
    SELECTION_CHOICES = [
        ('1', 'Актуальные'),
        ('2', 'Перспективные'),
    ]
    CATEGORY_CHOICES = [
        ('1', 'Производство'),
        ('2', 'Финансы'),
        ('3', 'Образование'),
    ]
    education = models.CharField(max_length=1, choices=EDUCATION_CHOICES, default='1')
    selection = models.CharField(max_length=1, choices=SELECTION_CHOICES, default='1')
    category = models.CharField(max_length=1, choices=CATEGORY_CHOICES, default='1')
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_vacancies')

    def __str__(self):
        return f'Vacancies {self.title} ({self.id})'

    class Meta:
        verbose_name = 'Vacancy'
        verbose_name_plural = 'Vacancies'
    
class VacanciesMember(models.Model):
    vacancy = models.ForeignKey('Vacancies', on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vacancy_applications')

    class Meta:
        unique_together = ('vacancy', 'user')

    def __str__(self):
        return f"VacanciesMember-{self.vacancy.id} - {self.user.username}"