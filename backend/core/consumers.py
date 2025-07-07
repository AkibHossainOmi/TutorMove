import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract token from query string
        query_string = self.scope["query_string"].decode()  # e.g. "token=xxx"
        token = None
        for part in query_string.split("&"):
            if part.startswith("token="):
                token = part.split("=")[1]
                break
        
        if token is None:
            await self.close()
            return

        # Validate token and get user
        user = await self.get_user_from_token(token)
        if not user or user.is_anonymous:
            await self.close()
            return
        
        self.user = user
        self.user_id = user.id
        self.group_name = f"user_{self.user_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"User {self.user_id} connected")
    
    @sync_to_async
    def get_user_from_token(self, token):
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from django.contrib.auth.models import AnonymousUser
        from django.contrib.auth import get_user_model
        from jwt import decode as jwt_decode
        from django.conf import settings
        User = get_user_model()
        try:
            # This validates token and gets payload
            UntypedToken(token)
            payload = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            user = User.objects.get(id=user_id)
            return user
        except (InvalidToken, TokenError, User.DoesNotExist, Exception) as e:
            print(f"Token validation error: {e}")
            return AnonymousUser()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            print(f"User {getattr(self, 'user_id', 'unknown')} disconnected with code {close_code}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "chat.message":
            msg = await self.save_message(data)
            other_ids = await self.get_other_participant_ids(msg.conversation.id, self.user_id)
            serialized_msg = self.serialize_message(msg)

            # Send message to other participants
            for pid in other_ids:
                await self.channel_layer.group_send(
                    f"user_{pid}",
                    {"type": "chat.message", "message": serialized_msg}
                )

            # Echo back to sender
            await self.send(text_data=json.dumps({
                "type": "chat.message",
                "message": serialized_msg,
            }))

        elif msg_type == "chat.typing":
            receiver_id = data.get("receiver_id")
            if receiver_id:
                await self.channel_layer.group_send(
                    f"user_{receiver_id}",
                    {
                        "type": "chat.typing",
                        "sender_id": self.user_id,
                        "is_typing": data.get("is_typing", False),
                    }
                )

        elif msg_type == "chat.read":
            conversation_id = data.get("conversation_id")
            if conversation_id:
                await self.mark_as_read(conversation_id)
                participants = await self.get_other_participant_ids(conversation_id, self.user_id)
                for pid in participants:
                    await self.channel_layer.group_send(
                        f"user_{pid}",
                        {
                            "type": "chat.read",
                            "conversation_id": conversation_id,
                            "reader_id": self.user_id,
                        }
                    )

        elif msg_type == "chat.search_user":
            keyword = data.get("keyword", "")
            results = await self.search_users(keyword)
            await self.send(text_data=json.dumps({
                "type": "chat.search_results",
                "results": results,
            }))

        elif msg_type == "chat.start_conversation":
            other_user_id = data.get("receiver_id") or data.get("user_id")
            if other_user_id:
                conv_data = await self.get_or_create_conversation(int(other_user_id))
                await self.send(text_data=json.dumps({
                    "type": "chat.conversation_started",
                    "conversation": conv_data,
                }))

        elif msg_type == "chat.get_conversations":
            conversations = await self.get_user_conversations()
            await self.send(text_data=json.dumps({
                "type": "chat.conversations",
                "conversations": conversations,
            }))

        elif msg_type == "chat.get_messages":
            conversation_id = data.get("conversation_id")
            messages = await self.get_conversation_messages(conversation_id)
            await self.send(text_data=json.dumps({
                "type": "chat.messages",
                "messages": messages,
            }))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat.message",
            "message": event["message"],
        }))

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat.typing",
            "sender_id": event["sender_id"],
            "is_typing": event["is_typing"],
        }))

    async def chat_read(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat.read",
            "conversation_id": event["conversation_id"],
            "reader_id": event["reader_id"],
        }))

    # ------------------ SYNC DB METHODS ------------------

    @sync_to_async
    def save_message(self, data):
        from core.models import User, Conversation, Message
        sender = User.objects.get(id=self.user_id)
        conversation = Conversation.objects.get(id=data["conversation_id"])
        return Message.objects.create(
            sender=sender,
            conversation=conversation,
            content=data.get("content", ""),
            timestamp=timezone.now(),
        )

    @sync_to_async
    def get_other_participant_ids(self, conversation_id, exclude_user_id):
        from core.models import ConversationParticipant
        return list(
            ConversationParticipant.objects
            .filter(conversation_id=conversation_id)
            .exclude(user_id=exclude_user_id)
            .values_list("user_id", flat=True)
        )

    @sync_to_async
    def mark_as_read(self, conversation_id):
        from core.models import Message, ConversationParticipant, MessageRead
        messages = Message.objects.filter(conversation_id=conversation_id)

        for msg in messages:
            MessageRead.objects.get_or_create(message=msg, user_id=self.user_id)

        latest_msg = messages.order_by("-timestamp").first()
        if latest_msg:
            participant = ConversationParticipant.objects.filter(
                user_id=self.user_id,
                conversation_id=conversation_id
            ).first()
            if participant:
                participant.last_read_message = latest_msg
                participant.save()

    @sync_to_async
    def search_users(self, keyword):
        from core.models import User
        return list(
            User.objects.filter(username__icontains=keyword)
                .exclude(id=self.user_id)
                .values("id", "username")
        )

    @sync_to_async
    def get_or_create_conversation(self, other_user_id):
        from core.models import User, Conversation, ConversationParticipant
        user1 = User.objects.get(id=self.user_id)
        user2 = User.objects.get(id=other_user_id)

        # Find conversation where participants are exactly user1 and user2
        conv = (
            Conversation.objects
            .filter(participants__user=user1)
            .filter(participants__user=user2)
            .distinct()
            .first()
        )

        if not conv:
            conv = Conversation.objects.create()
            ConversationParticipant.objects.bulk_create([
                ConversationParticipant(conversation=conv, user=user1),
                ConversationParticipant(conversation=conv, user=user2),
            ])

        participants = conv.participants.all().values("user__id", "user__username")
        return {
            "id": conv.id,
            "participants": [{"id": p["user__id"], "username": p["user__username"]} for p in participants],
        }

    @sync_to_async
    def get_user_conversations(self):
        from core.models import ConversationParticipant
        return [
            {
                "id": p.conversation.id,
                "participants": list(p.conversation.participants.all().values("user__id", "user__username"))
            }
            for p in ConversationParticipant.objects.select_related("conversation").filter(user_id=self.user_id)
        ]

    @sync_to_async
    def get_conversation_messages(self, conversation_id):
        from core.models import Message
        messages = Message.objects.filter(conversation_id=conversation_id).select_related("sender")
        return [self.serialize_message(m) for m in messages]

    def serialize_message(self, msg):
        return {
            "id": msg.id,
            "conversation_id": msg.conversation.id,
            "sender": {
                "id": msg.sender.id,
                "username": msg.sender.username,
            },
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat(),
            "is_system": msg.is_system,
            "attachment": msg.attachment.url if msg.attachment else None,
        }
