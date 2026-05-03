from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
import random
from .models import User, PasswordResetOTP
from .serializers import UserSerializer

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username')
        password = request.data.get('password')
        
        # Try to authenticate with username
        user = authenticate(username=username_or_email, password=password)
        
        # If username fails, try to authenticate with email
        if user is None:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
                
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class RequestOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Using filter().first() instead of get() to avoid MultipleObjectsReturned error
            user = User.objects.filter(email=email).first()
            
            if not user:
                return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)
                
            otp = str(random.randint(100000, 999999))
            PasswordResetOTP.objects.create(user=user, otp=otp)
            
            # Send Email (Console Backend)
            subject = 'TrueTie Password Reset OTP'
            message = f'Your OTP for password reset is: {otp}. It expires in 10 minutes.'
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [email]
            
            try:
                send_mail(subject, message, email_from, recipient_list)
            except Exception as e:
                # Still return success with OTP for dev purposes if email sending fails
                return Response({
                    "message": "OTP generated (Email sending failed)", 
                    "otp_debug": otp,
                    "dev_info": str(e)
                }, status=status.HTTP_200_OK)
                
            return Response({"message": "OTP sent to your email", "otp_debug": otp}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not email or not otp or not new_password:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Match the logic in RequestOTPView to handle multiple accounts with same email
            user = User.objects.filter(email=email).first()
            
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp, is_verified=False).last()
            
            if not otp_obj:
                return Response({"error": "Invalid OTP code. Please check the code and try again."}, status=status.HTTP_400_BAD_REQUEST)
                
            if otp_obj.is_expired():
                return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            otp_obj.is_verified = True
            otp_obj.save()
            
            return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Reset failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
