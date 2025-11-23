
import os
import django
from django.conf import settings
import sys

# Configure settings manually if DJANGO_SETTINGS_MODULE isn't set
if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    # Adjust this to match your actual settings module path
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Question, Answer

User = get_user_model()

def test_qna_flow():
    print("Setting up test data...")
    # Create Users
    student = User.objects.create_user(username='student1', password='password', user_type='student')
    tutor = User.objects.create_user(username='tutor1', password='password', user_type='tutor')
    student2 = User.objects.create_user(username='student2', password='password', user_type='student')

    # Setup Clients
    client_student = APIClient()
    client_student.force_authenticate(user=student)

    client_tutor = APIClient()
    client_tutor.force_authenticate(user=tutor)

    client_student2 = APIClient()
    client_student2.force_authenticate(user=student2)

    # 1. Student creates a question
    print("Testing Question Creation...")
    question_data = {'title': 'What is React?', 'content': 'I need help understanding React components.'}
    response = client_student.post('/api/questions/', question_data)
    assert response.status_code == status.HTTP_201_CREATED
    question_id = response.data['id']
    print("✅ Student created question.")

    # 2. Tutor tries to create a question (Should fail)
    response = client_tutor.post('/api/questions/', {'title': 'Tutor Q', 'content': 'Content'})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    print("✅ Tutor blocked from creating question.")

    # 3. Tutor answers the question
    print("Testing Answer Creation...")
    answer_data = {'question': question_id, 'content': 'React is a JS library for building UIs.'}
    response = client_tutor.post('/api/answers/', answer_data)
    assert response.status_code == status.HTTP_201_CREATED
    answer_id = response.data['id']
    print("✅ Tutor answered question.")

    # 4. Student tries to answer (Should fail)
    response = client_student.post('/api/answers/', {'question': question_id, 'content': 'I think so too.'})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    print("✅ Student blocked from answering.")

    # 5. Upvoting Question
    print("Testing Question Upvote...")
    # Tutor upvotes question
    response = client_tutor.post(f'/api/questions/{question_id}/upvote/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total_upvotes'] == 1

    # Student upvotes question
    response = client_student.post(f'/api/questions/{question_id}/upvote/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total_upvotes'] == 2

    # Student un-upvotes
    response = client_student.post(f'/api/questions/{question_id}/upvote/')
    assert response.data['total_upvotes'] == 1
    print("✅ Question upvoting works.")

    # 6. Answer Voting (Student Only)
    print("Testing Answer Voting...")

    # Tutor tries to upvote answer (Should fail)
    response = client_tutor.post(f'/api/answers/{answer_id}/upvote/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    print("✅ Tutor blocked from upvoting answer.")

    # Student upvotes answer
    response = client_student.post(f'/api/answers/{answer_id}/upvote/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total_upvotes'] == 1

    # Student2 downvotes answer
    response = client_student2.post(f'/api/answers/{answer_id}/downvote/')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total_downvotes'] == 1

    # Check total score logic manually if needed, but fields are separate
    print("✅ Answer voting works.")

    # 7. Security Check: Unauthorized Modification
    print("Testing Security (Modification)...")

    # Student2 tries to delete Student1's question
    response = client_student2.delete(f'/api/questions/{question_id}/')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    print("✅ Student2 blocked from deleting Student1's question.")

    # Tutor tries to edit Student1's question
    response = client_tutor.patch(f'/api/questions/{question_id}/', {'title': 'Hacked'})
    assert response.status_code == status.HTTP_403_FORBIDDEN
    print("✅ Tutor blocked from editing Student1's question.")

    # Student1 deletes their own question
    response = client_student.delete(f'/api/questions/{question_id}/')
    assert response.status_code == status.HTTP_204_NO_CONTENT
    print("✅ Student1 successfully deleted their own question.")

    print("\n🎉 All Q&A tests passed!")

    # Clean up
    student.delete()
    tutor.delete()
    student2.delete()

if __name__ == "__main__":
    try:
        test_qna_flow()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()
