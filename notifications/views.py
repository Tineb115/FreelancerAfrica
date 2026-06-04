from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

@api_view(['GET'])
def my_notifications(request):
    notifs = Notification.objects.filter(user=request.user)
    serializer = NotificationSerializer(notifs, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def mark_read(request, notif_id):
    notif = Notification.objects.filter(id=notif_id, user=request.user).first()
    if notif:
        notif.is_read = True
        notif.save()
    return Response({'ok': True})

@api_view(['POST'])
def mark_all_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'ok': True})

@api_view(['GET'])
def unread_count(request):
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({'count': count})
