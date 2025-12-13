from sqlalchemy import Column, String, Text, ForeignKey
from db.session import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    role = Column(String)
    content = Column(Text)
