import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = int(self.scope["url_route"]["kwargs"]["user_id"])
        self.group_name = f"user_{self.user_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"User {self.user_id} connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print(f"User {self.user_id} disconnected with code {close_code}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "chat.message":
            msg = await self.save_message(data)
            other_ids = await self.get_other_participant_ids(msg.conversation.id, self.user_id)

            # Send message to other participants
            for pid in other_ids:
                await self.channel_layer.group_send(
                    f"user_{pid}",
                    {
                        "type": "chat.message",
                        "message": self.serialize_message(msg),
                    }
                )

            # Echo back to sender
            await self.send(text_data=json.dumps({
                "type": "chat.message",
                "message": self.serialize_message(msg),
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
                conv_data = await self.get_or_create_conversation(other_user_id=int(other_user_id))
                await self.send(text_data=json.dumps({
                    "type": "chat.conversation_started",
                    "conversation": conv_data,
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

    @sync_to_async
    def save_message(self, data):
        from core.models import User, Conversation, Message
        sender = User.objects.get(id=data["sender_id"])
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
        from core.models import Message, ConversationParticipant
        latest_msg = Message.objects.filter(conversation_id=conversation_id).order_by("-timestamp").first()
        if not latest_msg:
            return
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
        qs = User.objects.filter(username__icontains=keyword).exclude(id=self.user_id)
        return list(qs.values("id", "username"))

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
            "is_system": getattr(msg, "is_system", False),
        }
