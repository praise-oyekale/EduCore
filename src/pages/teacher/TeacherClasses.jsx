import { useMemo, useState } from "react";
import {
  FaFlask,
  FaVial,
  FaPlus,
  FaTimes,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";

import "../teacher/teacherclasses.css";

const initialClasses = [
  {
    id: "CHEM201",
    name: "Chemistry 201",
    grade: "Grade 11-B",
    room: "Room 214",
    students: 28,
    attendance: 95,
    averageScore: 88,
    color: "blue",
    icon: "flask",
  },
  {
    id: "CHEM101",
    name: "Chemistry 101",
    grade: "Grade 10-A",
    room: "Room 214",
    students: 31,
    attendance: 92,
    averageScore: 78,
    color: "purple",
    icon: "flask",
  },
  {
    id: "ADVCH",
    name: "Advanced Chemistry",
    grade: "Grade 12-A",
    room: "Room 214",
    students: 22,
    attendance: 89,
    averageScore: 92,
    color: "orange",
    icon: "vial",
  },
  {
    id: "LAB11",
    name: "Lab Session",
    grade: "Grade 11-B",
    room: "Lab 2",
    students: 28,
    attendance: 96,
    averageScore: 85,
    color: "green",
    icon: "lab",
  },
];

function ClassIcon({ icon }) {
  if (icon === "vial") {
    return <FaVial />;
  }

  if (icon === "lab") {
    return (
      <span className="teacher-class-double-icon">
        <FaFlask />
        <FaVial />
      </span>
    );
  }

  return <FaFlask />;
}

function ClassCard({ classItem, onManage }) {
  return (
    <article className="teacher-class-card">
      <div className="teacher-class-card-top">
        <div className={`teacher-class-icon ${classItem.color}`}>
          <ClassIcon icon={classItem.icon} />
        </div>

        <span className="teacher-class-student-badge">
          {classItem.students} students
        </span>
      </div>

      <div className="teacher-class-card-info">
        <h2>{classItem.name}</h2>
        <p>
          {classItem.grade} · {classItem.room}
        </p>
      </div>

      <div className="teacher-class-progress">
        <div
          className={`teacher-class-progress-fill ${classItem.color}`}
          style={{
            width: `${classItem.averageScore}%`,
          }}
        />
      </div>

      <div className="teacher-class-card-bottom">
        <span>Avg. score {classItem.averageScore}%</span>

        <button
          type="button"
          className="teacher-class-small-button"
          onClick={() => onManage(classItem)}
        >
          Manage
        </button>
      </div>
    </article>
  );
}

function CreateClassModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    room: "",
    students: "0",
    attendance: "0",
    averageScore: "0",
    color: "blue",
    icon: "flask",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.grade.trim()) {
      setError("Please enter a class name and grade.");
      return;
    }

    const students = Number(formData.students);
    const attendance = Number(formData.attendance);
    const averageScore = Number(formData.averageScore);

    if (
      !Number.isInteger(students) ||
      students < 0 ||
      !Number.isFinite(attendance) ||
      attendance < 0 ||
      attendance > 100 ||
      !Number.isFinite(averageScore) ||
      averageScore < 0 ||
      averageScore > 100
    ) {
      setError("Enter valid student counts and percentages.");
      return;
    }

    onCreate({
      id: `CLASS-${Date.now()}`,
      name: formData.name.trim(),
      grade: formData.grade.trim(),
      room: formData.room.trim() || "Not assigned",
      students,
      attendance,
      averageScore,
      color: formData.color,
      icon: formData.icon,
    });

    onClose();
  }

  return (
    <div
      className="teacher-classes-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="teacher-classes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-class-heading"
      >
        <div className="teacher-classes-modal-heading">
          <div>
            <h2 id="create-class-heading">Create class</h2>
            <p>Add a class to your class list.</p>
          </div>

          <button
            type="button"
            className="teacher-classes-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="teacher-classes-form-grid">
            <div className="teacher-classes-form-field">
              <label htmlFor="class-name">Class name *</label>
              <input
                id="class-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Chemistry 201"
                required
              />
            </div>

            <div className="teacher-classes-form-field">
              <label htmlFor="class-grade">Grade / Class *</label>
              <input
                id="class-grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g. SS2 Science"
                required
              />
            </div>

            <div className="teacher-classes-form-field">
              <label htmlFor="class-room">Room</label>
              <input
                id="class-room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                placeholder="e.g. Room 214"
              />
            </div>

            <div className="teacher-classes-form-field">
              <label htmlFor="class-students">Number of students</label>
              <input
                id="class-students"
                name="students"
                type="number"
                min="0"
                step="1"
                value={formData.students}
                onChange={handleChange}
              />
            </div>

            <div className="teacher-classes-form-field">
              <label htmlFor="class-attendance">Average attendance (%)</label>
              <input
                id="class-attendance"
                name="attendance"
                type="number"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={handleChange}
              />
            </div>

            <div className="teacher-classes-form-field">
              <label htmlFor="class-score">Average score (%)</label>
              <input
                id="class-score"
                name="averageScore"
                type="number"
                min="0"
                max="100"
                value={formData.averageScore}
                onChange={handleChange}
              />
            </div>

            <div className="teacher-classes-form-field">
              <label htmlFor="class-color">Card color</label>
              <select
                id="class-color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              >
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
                <option value="green">Green</option>
              </select>
            </div>
          </div>

          {error && <p className="teacher-classes-form-error">{error}</p>}

          <div className="teacher-classes-modal-actions">
            <button
              type="button"
              className="teacher-classes-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="teacher-classes-create-button">
              <FaPlus />
              Create class
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function TeacherClasses() {
  const [classes, setClasses] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return classes;

    return classes.filter((classItem) =>
      [classItem.name, classItem.grade, classItem.room].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [classes, search]);

  function handleCreateClass(newClass) {
    setClasses((previous) => [...previous, newClass]);
    setNotice(
      "Class added to this page. It will not persist after refresh until Firestore is connected.",
    );
  }

  function handleManage(classItem) {
    setNotice(
      `You selected ${classItem.name}. The class details, roster, attendance, and grades can be connected here next.`,
    );
  }

  function handleOpenClass(classItem) {
    handleManage(classItem);
  }

  return (
    <main className="teacher-classes-page">
      <div className="teacher-classes-container">
        <header className="teacher-classes-header">
          <div>
            <h1>My Classes</h1>
            <p>{classes.length} active classes this semester · Fall 2026.</p>
          </div>

          <button
            type="button"
            className="teacher-classes-create-button"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus />
            Create class
          </button>
        </header>

        {notice && (
          <div className="teacher-classes-notice" role="status">
            <p>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="teacher-classes-search">
          <FaSearch />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by class, grade, or room..."
            aria-label="Search classes"
          />
        </div>

        <section className="teacher-classes-grid">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onManage={handleManage}
            />
          ))}

          {filteredClasses.length === 0 && (
            <div className="teacher-classes-empty">
              <FaSearch />
              <h2>No classes found</h2>
              <p>Try another search term.</p>
            </div>
          )}
        </section>

        <section className="teacher-classes-roster-card">
          <div className="teacher-classes-roster-heading">
            <div>
              <h2>Class roster overview</h2>
              <p>Summary of your classes and their performance.</p>
            </div>
          </div>

          <div className="teacher-classes-table-wrapper">
            <table className="teacher-classes-table">
              <thead>
                <tr>
                  <th>CLASS</th>
                  <th>GRADE</th>
                  <th>ROOM</th>
                  <th>STUDENTS</th>
                  <th>AVG. ATTENDANCE</th>
                  <th>AVG. SCORE</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredClasses.map((classItem) => (
                  <tr key={classItem.id}>
                    <td className="teacher-classes-table-name">
                      {classItem.name}
                    </td>
                    <td>{classItem.grade}</td>
                    <td>{classItem.room}</td>
                    <td>{classItem.students}</td>
                    <td>{classItem.attendance}%</td>
                    <td>{classItem.averageScore}%</td>
                    <td>
                      <button
                        type="button"
                        className="teacher-classes-open-button"
                        onClick={() => handleOpenClass(classItem)}
                      >
                        Open <FaArrowRight />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredClasses.length === 0 && (
                  <tr>
                    <td colSpan="7" className="teacher-classes-no-rows">
                      No classes to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClass}
        />
      )}
    </main>
  );
}
