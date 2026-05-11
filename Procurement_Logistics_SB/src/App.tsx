import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectDetail } from './pages/ProjectDetail';
import { IntakeForm } from './pages/IntakeForm';
import { Analytics } from './pages/Analytics';
import { useProjects } from './hooks/useProjects';
import type { Project, IntakeFormData, GateId } from './types';

type Page = 'dashboard' | 'intake' | 'projects' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { projects, addProject, updateGateStatus, addComment, submitForReview } = useProjects();

  const pendingCount = projects.filter((p) =>
    p.gates.some((g) => g.status === 'in_review'),
  ).length;

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId) ?? null
    : null;

  const handleViewProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setCurrentPage('projects');
  };

  const handleIntakeSubmit = (data: IntakeFormData) => {
    const newProject = addProject(data);
    setSelectedProjectId(newProject.id);
    setCurrentPage('projects');
  };

  const handleUpdateGateStatus = (
    projectId: string,
    gateId: GateId,
    status: 'approved' | 'rejected' | 'in_review' | 'on_hold',
    reason?: string,
  ) => {
    updateGateStatus(projectId, gateId, status, reason);
  };

  const handleAddComment = (
    projectId: string,
    gateId: GateId,
    content: string,
    authorName: string,
    authorRole: string,
  ) => {
    addComment(projectId, gateId, content, authorName, authorRole);
  };

  const handleSubmitForReview = (projectId: string, gateId: GateId) => {
    submitForReview(projectId, gateId);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'projects') setSelectedProjectId(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        projectCount={projects.length}
        pendingCount={pendingCount}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {currentPage === 'dashboard' && (
            <Dashboard
              projects={projects}
              onViewProject={handleViewProject}
              onNewRequest={() => setCurrentPage('intake')}
            />
          )}

          {currentPage === 'projects' && !selectedProject && (
            <ProjectsList
              projects={projects}
              onViewProject={handleViewProject}
              onNewRequest={() => setCurrentPage('intake')}
            />
          )}

          {currentPage === 'projects' && selectedProject && (
            <ProjectDetail
              project={selectedProject}
              onBack={() => setSelectedProjectId(null)}
              onUpdateGateStatus={handleUpdateGateStatus}
              onAddComment={handleAddComment}
              onSubmitForReview={handleSubmitForReview}
            />
          )}

          {currentPage === 'intake' && (
            <IntakeForm
              onSubmit={handleIntakeSubmit}
              onCancel={() => setCurrentPage('dashboard')}
            />
          )}

          {currentPage === 'analytics' && <Analytics projects={projects} />}
        </div>
      </main>
    </div>
  );
}

export default App;
