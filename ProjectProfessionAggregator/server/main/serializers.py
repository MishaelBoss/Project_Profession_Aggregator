from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Vacancies, Company, VacanciesMember


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['name', 'surname', 'patronymic', 'phone', 'about', 'years', 'experience', 'admin_type']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='userprofile', read_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'profile', 'is_superuser']
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if not representation.get('profile'):
            representation['profile'] = {
                'name': '',
                'surname': '',
                'patronymic': '',
                'phone': '',
                'about': '',
                'years': '',
                'experience': '',
                'admin_type': 'none'
            }
        return representation


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(required=False, allow_blank=True)
    surname = serializers.CharField(required=False, allow_blank=True)
    patronymic = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    about = serializers.CharField(required=False, allow_blank=True)
    years = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'name', 'surname', 'patronymic', 'phone', 'about', 'years', 'experience']
    def create(self, validated_data):
        profile_data = {
            'name': validated_data.pop('name', ''),
            'surname': validated_data.pop('surname', ''),
            'patronymic': validated_data.pop('patronymic', ''),
            'phone': validated_data.pop('phone', ''),
            'about': validated_data.pop('about', ''),
            'years': validated_data.pop('years', ''),
            'experience': validated_data.pop('experience', '')
        }
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            profile = UserProfile.objects.create(
                user=user,
                name=profile_data['name'],
                surname=profile_data['surname'],
                patronymic=profile_data['patronymic'],
                phone=profile_data['phone'],
                about=profile_data['about'],
                years=profile_data['years'],
                experience=profile_data['experience']
            )
            return user
        except Exception as e:
            raise


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)



class CompanyTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name_company', 'email_company', 'phone_company', 'address_company', 'image']
        read_only_fields = ['id']
    def validate_company(self, value):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Требуется авторизация")
        if not Company.objects.filter(id=value.id, owner=request.user).exists():
            raise serializers.ValidationError("Вы не являетесь владельцем этой компании")
        return value
    def create(self, request, validated_data):
        value = validated_data.get()
        return super().create(validated_data)
    def validate(self, data):
        request = self.context.get('request')
        if request and request.method in ['POST', 'PUT']:
            try:
                if not (
                    request.user.userprofile.admin_type in ['employer', 'admin'] or
                    request.user.is_superuser
                ):
                    raise serializers.ValidationError(
                        "Только работодатели, администраторы или суперпользователи могут создавать вакансии"
                    )
            except AttributeError:
                raise serializers.ValidationError(
                    "Профиль пользователя не настроен. Обратитесь к администратору."
                )
            if not data.get('company'):
                raise serializers.ValidationError({"company_id": "Это поле обязательно."})


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name_company', 'email_company', 'phone_company', 'address_company', 'image']
        read_only_fields = ['id']
    def create(self, validated_data):
        owner = self.context['request'].user
        return Company.objects.create(owner=owner, **validated_data)
    def validate(self, data):
        request = self.context.get('request')
        if request and request.method in ['POST', 'PUT']:
            try:
                if not (
                    request.user.userprofile.admin_type in ['employer', 'admin'] or
                    request.user.is_superuser
                ):
                    raise serializers.ValidationError(
                        "Только работодатели, администраторы или суперпользователи могут создавать компании"
                    )
            except AttributeError:
                raise serializers.ValidationError(
                    "Профиль пользователя не настроен. Обратитесь к администратору."
                )
        return data


class AddVacanciesSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_details = CompanySerializer(source='company', read_only=True)
    education_display = serializers.CharField(source='get_education_display', read_only=True)
    selection_display = serializers.CharField(source='get_selection_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True, required=True
    )
    class Meta:
        model = Vacancies
        fields = [
            'id', 'company', 'company_id', 'title', 'JobTitle', 'salary', 'experience',
            'graphy', 'watch', 'information', 'education_information',
            'education_link', 'education', 'selection', 'category', 'company_details',
            'education_display', 'selection_display', 'category_display'
        ]
        read_only_fields = ['id', 'education_display', 'selection_display', 'category_display']
    def validate_company(self, value):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Требуется авторизация")
        if not Company.objects.filter(id=value.id, owner=request.user).exists():
            raise serializers.ValidationError("Вы не являетесь владельцем этой компании")
        return value
    def create(self, validated_data):
        # Преобразование человекочитаемых значений в коды для полей с ChoiceField
        for field in ['education', 'selection', 'category']:
            value = validated_data.get(field)
            if value:
                # Получаем choices для поля из модели
                choices = getattr(Vacancies, f'{field.upper()}_CHOICES', None)
                if choices:
                    choices_map = {v: k for k, v in choices}
                    validated_data[field] = choices_map.get(value, value)
        return super().create(validated_data)
    def validate(self, data):
        request = self.context.get('request')
        if request and request.method in ['POST', 'PUT']:
            try:
                if not (
                    request.user.userprofile.admin_type in ['employer', 'admin'] or
                    request.user.is_superuser
                ):
                    raise serializers.ValidationError(
                        "Только работодатели, администраторы или суперпользователи могут создавать вакансии"
                    )
            except AttributeError:
                raise serializers.ValidationError(
                    "Профиль пользователя не настроен. Обратитесь к администратору."
                )
            if not data.get('company'):
                raise serializers.ValidationError({"company_id": "Это поле обязательно."})
        return data


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacanciesMember
        fields = ['id', 'user', 'vacancy', 'created_at']
        read_only_fields = ['user', 'created_at']
    def validate_vacancy(self, value):
        if not Vacancies.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Вакансия не найдена")
        return value
    def validate(self, data):
        request = self.context.get('request')
        vacancy = data.get('vacancy')
        if VacanciesMember.objects.filter(vacancy=vacancy, user=request.user).exists():
            raise serializers.ValidationError("Вы уже подали заявку на эту вакансию")
        return data
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    


class VacanciesMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacanciesMember
        fields = ['id', 'vacancy', 'user']
        read_only_fields = ['user']

    def validate_vacancy(self, value):
        if not Vacancies.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Вакансия не найдена")
        return value

    def validate(self, data):
        request = self.context.get('request')
        vacancy = data.get('vacancy')
        if VacanciesMember.objects.filter(vacancy=vacancy, user=request.user).exists():
            raise serializers.ValidationError("Вы уже подали заявку на эту вакансию")
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)