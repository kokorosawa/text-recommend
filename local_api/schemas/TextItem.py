from pydantic import BaseModel


class TextItem(BaseModel):
    content: str
