from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfileViewSet, SkillViewSet, ArchitectureEntryViewSet, CurrentFocusItemViewSet, ProjectViewSet,
    ExperienceViewSet, BlogPostViewSet, ActivityViewSet,
    CertificationViewSet, ContactMessageViewSet
)

router = DefaultRouter()
router.register('profile', ProfileViewSet)
router.register('skills', SkillViewSet)
router.register('architecture', ArchitectureEntryViewSet)
router.register('current-focus', CurrentFocusItemViewSet)
router.register('projects', ProjectViewSet)
router.register('experience', ExperienceViewSet)
router.register('blog', BlogPostViewSet)
router.register('activities', ActivityViewSet)
router.register('certifications', CertificationViewSet)
router.register('contact', ContactMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
