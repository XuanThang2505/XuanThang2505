import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import ProjectForm from './components/ProjectForm';
import GanttChart from './components/GanttChart';
import DependencyMap from './components/DependencyMap';
import ResourceView from './components/ResourceView';
import RiskView from './components/RiskView';
import { useStore } from './store/useStore';
import { genId } from './utils/format';

export default function App() {
  const { state, dispatch } = useStore();
  const { projects, members } = state;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const openView = (p) => setViewProject(p);
  const openEdit = (p) => { setEditProject(p); setShowForm(true); };
  const openAdd = () => { setEditProject(null); setShowForm(true); };
  const closeDetail = () => setViewProject(null);
  const closeForm = () => { setShowForm(false); setEditProject(null); };

  const handleSave = (data) => {
    if (editProject) {
      dispatch({ type: 'UPDATE_PROJECT', payload: data });
    } else {
      dispatch({ type: 'ADD_PROJECT', payload: { ...data, id: genId('p') } });
    }
    closeForm();
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
    if (viewProject?.id === id) setViewProject(null);
  };

  const handleEditFromDetail = (p) => {
    setViewProject(null);
    openEdit(p);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard projects={projects} members={members} onSelectProject={openView} />;
      case 'projects':
        return (
          <ProjectList
            projects={projects}
            members={members}
            onView={openView}
            onEdit={openEdit}
            onAdd={openAdd}
            onDelete={handleDelete}
          />
        );
      case 'gantt':
        return <GanttChart projects={projects} onView={openView} />;
      case 'dependencies':
        return <DependencyMap projects={projects} onView={openView} />;
      case 'resources':
        return <ResourceView projects={projects} members={members} />;
      case 'risks':
        return <RiskView projects={projects} onView={openView} />;
      default:
        return (
          <div className="p-6 text-center text-slate-400 mt-20">
            <p className="text-lg font-medium">Tính năng đang phát triển</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar
        active={activeTab}
        setActive={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {viewProject && (
        <ProjectDetail
          project={viewProject}
          projects={projects}
          members={members}
          onClose={closeDetail}
          onEdit={handleEditFromDetail}
        />
      )}

      {showForm && (
        <ProjectForm
          project={editProject}
          projects={projects}
          members={members}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
