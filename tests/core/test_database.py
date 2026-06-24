import pytest
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import text



#conectar la base de datos ->para correrr el test 
@pytest.mark.asyncio
async def test_return_session():
    db_gen = get_db()
    session = await db_gen.__anext__()

    assert isinstance(session, AsyncSession)

    result = await session.execute(text("SELECT 1"))
    assert result.escalar == 1
