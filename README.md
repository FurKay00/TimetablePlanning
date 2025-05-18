# 📅 Conflict visualization and editing for timetable planning 

_Repository for a case study. Read only and won't be maintained further!_

---

## 🎯 Overview
This project aims to provide a full-stack solution to create, visualize, and manage timetables within a university setting, particularly focusing on the visualization and subsequent editing of appointment conflicts:
- **Frontend** (Angular)  
- **Backend** (FastAPI + SQLAlchemy)  
- **Database** (PostgreSQL)

---

## ✨ Current Features

- ✅ **Interactive Visualization**  
  - Drag-and-drop of timetable slots
  - Synchronization between input form and schedule preview   
  - Appointment filtering based on rooms, classes and lecturers
- ✅ **Conflict Visualization**
  - Visualization of resource conflicts and room capacity conflicts
  - Editing opportunity through timeline component
- ✅ **Role-based workflows**  
  - Secretary, lecturer and student views  
- ✅ **Extensible architecture**  
  - Clear separation of frontend, backend and DB layers  
  - Well-documented code and OpenAPI schema  

---

## 📦 Tech Stack

| Layer     | Used Technologies and Libraries                                       |
| --------- | ------------------------------------------------ |
| Frontend  | Angular 18 <br>Angular Material<br>Angular Calender<br>Vis.js timeline<br>TypeScript<br>SCSS               |
| Backend   | FastAPI<br>Python 3.11<br>SQLAlchemy<br>Pydantic       |
| Database  | PostgreSQL 16.3           |
| Dev Tools | GitHub<br>Figma<br>VisualParadigm<br>SonarLint     |

---

## 🛠 Manual Setup
> [!WARNING]
> The database is not included and both backend and frontend are currently only locally executable. The database relational model is available [here](https://github.com/FurKay00/TimetablePlanning/blob/main/docs/architecture/er_diagram.jpg)
### 1. Clone the repo  
```bash
git clone https://github.com/FurKay00/TimetablePlanning.git
cd TimetablePlanning
```

### Backend
Create & activate a virtualenv
```
python -m venv .venv && source .venv/bin/activate
```
Install dependencies
```
pip install -r backend/requirements.txt
```
Start the server
```
uvicorn main:app --reload --factory
```
### Frontend
Install Angular CLI & dependencies
```
npm install -g @angular/cli
cd frontend
npm install
```
Serve the app
```
ng serve --open
```

## 📄 License

This project is licensed under the MIT License.
