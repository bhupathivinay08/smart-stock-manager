\# Smart Stock Backend



FastAPI + PostgreSQL backend for \*\*Smart Stock Manager\*\* — an inventory management system.



\## 🛠 Tech Stack

\- FastAPI

\- SQLAlchemy + PostgreSQL

\- Pydantic

\- Uvicorn



\## 🚀 Setup



```bash

python -m venv myenv

myenv\\Scripts\\activate

pip install -r requirements.txt

copy .env.example .env

\# edit .env with your Postgres credentials

uvicorn main:app --reload

