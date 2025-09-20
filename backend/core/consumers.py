import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract token from query string
        query_string = self.scope["query_string"].decode()
        token = None
        for part in query_string.split("&"):
            if part.startswith("token="):
                token = part.split("=")[1]
                break

        if not token:
            await self.close()
            return

        user = await self.get_user_from_token(token)
        if not user or user.is_anonymous:
            await self.close()
            return

        self.user = user
        self.user_id = user.id
        self.group_name = f"user_{self.user_id}"

        # Join group
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
            UntypedToken(token)  # validate token
            payload = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            user = User.objects.get(id=user_id)
            return user
        except (InvalidToken, TokenError, User.DoesNotExist, Exception) as e:
            print(f"Token validation error: {e}")
            return AnonymousUser()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            print(f"User {getattr(self, 'user_id', 'unknown')} disconnected with code {close_code}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "chat.message":
            await self.handle_chat_message(data)
        elif msg_type == "chat.typing":
            await self.handle_chat_typing(data)
        elif msg_type == "chat.read":
            await self.handle_chat_read(data)
        elif msg_type == "chat.delivered":
            await self.handle_chat_delivered(data)
        elif msg_type == "chat.search_user":
            await self.handle_chat_search(data)
        elif msg_type == "chat.start_conversation":
            await self.handle_start_conversation(data)
        elif msg_type == "chat.get_conversations":
            await self.handle_get_conversations()
        elif msg_type == "chat.get_messages":
            await self.handle_get_messages(data)
        else:
            # Unknown message type - optionally log or ignore
            pass

    # Handlers for different message types

    async def handle_chat_message(self, data):
        msg = await self.save_message(data)
        other_ids = await self.get_other_participant_ids(msg.conversation.id, self.user_id)

        # Check unlock status for each recipient
        for receiver_id in other_ids:
            unlocked = await self.is_contact_unlocked(self.user_id, receiver_id)
            if not unlocked:
                await self.send(text_data=json.dumps({
                    "type": "chat.unlock",
                    "student_id": self.user_id,
                    "tutor_id": receiver_id,
                    "message": "Unlock contact to send messages."
                }))
                return  # block sending message

        serialized_msg = await self.serialize_message(msg)

        # Send message to all participants except sender
        for pid in other_ids:
            await self.channel_layer.group_send(
                f"user_{pid}",
                {"type": "chat.message", "message": serialized_msg},
            )

        # Send message back to sender
        await self.send(text_data=json.dumps({
            "type": "chat.message",
            "message": serialized_msg
        }))

    async def handle_chat_typing(self, data):
        receiver_id = data.get("receiver_id")
        if receiver_id:
            await self.channel_layer.group_send(
                f"user_{receiver_id}",
                {
                    "type": "chat.typing",
                    "sender_id": self.user_id,
                    "is_typing": data.get("is_typing", False),
                },
            )

    async def handle_chat_read(self, data):
        conversation_id = data.get("conversation_id")
        if not conversation_id:
            return

        # Mark messages as seen for current user in conversation
        await self.mark_as_read(conversation_id)

        # Notify other participants about read
        participants = await self.get_other_participant_ids(conversation_id, self.user_id)
        for pid in participants:
            await self.channel_layer.group_send(
                f"user_{pid}",
                {
                    "type": "chat.read",
                    "conversation_id": conversation_id,
                    "reader_id": self.user_id,
                },
            )

        # Notify message senders about status update 'seen'
        newly_read_message_ids = await self.get_newly_read_message_ids(conversation_id, self.user_id)
        for message_id in newly_read_message_ids:
            msg = await self.get_message(message_id)
            if msg:
                await self.channel_layer.group_send(
                    f"user_{msg.sender.id}",
                    {
                        "type": "chat.message_status",
                        "message_id": message_id,
                        "status": "seen",
                    },
                )

    async def handle_chat_delivered(self, data):
        message_id = data.get("message_id")
        if message_id:
            await self.mark_message_delivered(message_id, self.user_id)

    async def handle_chat_search(self, data):
        keyword = data.get("keyword", "")
        results = await self.search_users(keyword)
        await self.send(text_data=json.dumps({
            "type": "chat.search_results",
            "results": results
        }))

    async def handle_start_conversation(self, data):
        other_user_id = data.get("receiver_id") or data.get("user_id")
        if not other_user_id:
            return

        unlocked = await self.is_contact_unlocked(self.user_id, int(other_user_id))
        if not unlocked:
            await self.send(text_data=json.dumps({
                "type": "chat.unlock",
                "student_id": self.user_id,
                "tutor_id": int(other_user_id),
                "message": "Contact not unlocked. Unlock required to start a conversation."
            }))
            return

        conv_data = await self.get_or_create_conversation(int(other_user_id))
        await self.send(text_data=json.dumps({
            "type": "chat.conversation_started",
            "conversation": conv_data
        }))

    async def handle_get_conversations(self):
        conversations = await self.get_user_conversations()
        await self.send(text_data=json.dumps({
            "type": "chat.conversations",
            "conversations": conversations
        }))

    async def handle_get_messages(self, data):
        conversation_id = data.get("conversation_id")
        if not conversation_id:
            return
        messages = await self.get_conversation_messages(conversation_id)
        await self.send(text_data=json.dumps({
            "type": "chat.messages",
            "messages": messages
        }))

    # Channel layer event handlers

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat.message",
            "message": event["message"]
        }))

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat.typing",
            "sender_id": event["sender_id"],
            "is_typing": event["is_typing"]
        }))

    async def chat_read(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat.read",
            "conversation_id": event["conversation_id"],
            "reader_id": event["reader_id"]
        }))

    async def chat_message_status(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat.message_status",
            "message_id": event["message_id"],
            "status": event["status"]
        }))

    # --------- DB operations ---------

    @sync_to_async
    def save_message(self, data):
        from core.models import User, Conversation, Message, ConversationParticipant, MessageRead

        sender = User.objects.get(id=self.user_id)
        conversation = Conversation.objects.get(id=data["conversation_id"])
        msg = Message.objects.create(
            sender=sender,
            conversation=conversation,
            content=data.get("content", ""),
            timestamp=timezone.now(),
        )

        # Create MessageRead entries with status 'sent' for all participants except sender
        participant_ids = ConversationParticipant.objects.filter(conversation=conversation).exclude(user=sender).values_list('user_id', flat=True)
        for uid in participant_ids:
            MessageRead.objects.create(message=msg, user_id=uid, status='sent')

        return msg

    @sync_to_async
    def get_other_participant_ids(self, conversation_id, exclude_user_id):
        from core.models import ConversationParticipant
        return list(
            ConversationParticipant.objects.filter(conversation_id=conversation_id)
            .exclude(user_id=exclude_user_id)
            .values_list("user_id", flat=True)
        )

    @sync_to_async
    def mark_as_read(self, conversation_id):
        from core.models import MessageRead, Message, ConversationParticipant

        # Mark all unread MessageRead entries as 'seen' for this user in this conversation
        unread_reads = MessageRead.objects.filter(
            user_id=self.user_id,
            message__conversation_id=conversation_id
        ).exclude(status='seen')

        unread_reads.update(status='seen', read_at=timezone.now())

        # Update participant's last_read_message pointer
        latest_msg = Message.objects.filter(conversation_id=conversation_id).order_by("-timestamp").first()
        if latest_msg:
            participant = ConversationParticipant.objects.filter(user_id=self.user_id, conversation_id=conversation_id).first()
            if participant:
                participant.last_read_message = latest_msg
                participant.save()

    @sync_to_async
    def get_newly_read_message_ids(self, conversation_id, user_id):
        from core.models import MessageRead

        # Return message IDs that are now seen by user
        return list(
            MessageRead.objects.filter(
                user_id=user_id,
                message__conversation_id=conversation_id,
                status='seen'
            ).values_list('message_id', flat=True)
        )

    @sync_to_async
    def get_message(self, message_id):
        from core.models import Message
        try:
            return Message.objects.select_related("sender", "conversation").get(id=message_id)
        except Message.DoesNotExist:
            return None

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

        conv = (
            Conversation.objects.filter(participants__user=user1)
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
        from core.models import ConversationParticipant, Message

        result = []
        cps = ConversationParticipant.objects.select_related("conversation").filter(user_id=self.user_id)

        for p in cps:
            conv = p.conversation
            last_read = p.last_read_message

            last_msg = Message.objects.filter(conversation=conv).order_by("-timestamp").first()

            has_unread = False
            if last_msg and (not last_read or last_msg.timestamp > last_read.timestamp) and last_msg.sender_id != self.user_id:
                has_unread = True

            last_message_data = {
                "content": last_msg.content if last_msg else "",
                "timestamp": last_msg.timestamp.isoformat() if last_msg else None,
                "sender_id": last_msg.sender.id if last_msg else None,
                "sender_username": last_msg.sender.username if last_msg else None,
            }

            result.append({
                "id": conv.id,
                "participants": list(conv.participants.all().values("user__id", "user__username")),
                "has_unread": has_unread,
                "last_message": last_message_data,
            })

        return result

    @sync_to_async
    def get_conversation_messages_sync(self, conversation_id):
        from core.models import Message
        return list(
            Message.objects.filter(conversation_id=conversation_id).select_related("sender", "conversation").order_by("timestamp")
        )

    async def get_conversation_messages(self, conversation_id):
        messages = await self.get_conversation_messages_sync(conversation_id)
        results = []
        for m in messages:
            serialized = await self.serialize_message(m)
            results.append(serialized)
        return results

    async def serialize_message(self, msg):
        from core.models import MessageRead
        from asgiref.sync import sync_to_async

        status = None
        is_read = False

        if msg.sender.id == self.user_id:
            other_user_ids = await sync_to_async(
                lambda: list(msg.conversation.participants.exclude(user_id=self.user_id).values_list('user_id', flat=True))
            )()

            if other_user_ids:
                try:
                    mr = await sync_to_async(msg.reads.get)(user_id=other_user_ids[0])
                    status = mr.status
                    is_read = (status == 'seen')
                except MessageRead.DoesNotExist:
                    status = None
                    is_read = False

        return {
            "id": msg.id,
            "conversation_id": msg.conversation.id,
            "sender": {"id": msg.sender.id, "username": msg.sender.username},
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat(),
            "is_system": getattr(msg, "is_system", False),
            "attachment": msg.attachment.url if getattr(msg, "attachment", None) else None,
            "is_read": is_read,
            "status": status,
        }

    @sync_to_async
    def mark_message_delivered(self, message_id, user_id):
        from core.models import MessageRead
        try:
            mr = MessageRead.objects.get(message_id=message_id, user_id=user_id)
            if mr.status == 'sent':
                mr.status = 'delivered'
                mr.save()
        except MessageRead.DoesNotExist:
            pass

    @sync_to_async
    def is_contact_unlocked(self, user1_id, user2_id):
        from core.models import ContactUnlock
        from django.db.models import Q

        return ContactUnlock.objects.filter(
            Q(unlocker_id=user1_id, target_id=user2_id) |
            Q(unlocker_id=user2_id, target_id=user1_id)
        ).exists()
