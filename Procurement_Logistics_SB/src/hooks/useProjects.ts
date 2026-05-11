import { useState, useCallback } from 'react';
import type { Project, IntakeFormData, TollgateStatus, GateId } from '../types';
import { SAMPLE_PROJECTS } from '../data/sampleData';
import { GATE_DEFINITIONS } from '../data/constants';
import { generateId } from '../utils/helpers';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);

  const addProject = useCallback((data: IntakeFormData): Project => {
    const newProject: Project = {
      id: generateId(),
      title: data.title,
      description: data.description,
      projectType: data.projectType,
      status: 'draft',
      priority: data.priority,
      currentGate: 0,
      requestedBy: data.requestedBy,
      requestedByEmail: data.requestedByEmail,
      department: data.department,
      estimatedBudget: Number(data.estimatedBudget),
      currency: data.currency,
      startDate: data.startDate,
      targetEndDate: data.targetEndDate,
      suppliers: data.suppliers ? data.suppliers.split(',').map((s) => s.trim()).filter(Boolean) : [],
      stakeholders: [
        {
          id: generateId(),
          name: data.requestedBy,
          role: 'Project Requester',
          email: data.requestedByEmail,
          department: data.department,
        },
      ],
      gates: ([0, 1, 2, 3, 4] as GateId[]).map((id) => ({
        id,
        name: GATE_DEFINITIONS[id].name,
        description: GATE_DEFINITIONS[id].description,
        status: 'not_started' as TollgateStatus,
        comments: [],
        requiredDocuments: GATE_DEFINITIONS[id].requiredDocuments,
        submittedDocuments: [],
        reviewers: [],
      })),
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateGateStatus = useCallback(
    (projectId: string, gateId: GateId, status: TollgateStatus, reason?: string) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const gates = p.gates.map((g) =>
            g.id === gateId
              ? {
                  ...g,
                  status,
                  approvedAt: status === 'approved' ? new Date().toISOString() : g.approvedAt,
                  approvedBy: status === 'approved' ? 'Current User' : g.approvedBy,
                  rejectedAt: status === 'rejected' ? new Date().toISOString() : g.rejectedAt,
                  rejectedReason: status === 'rejected' ? reason : g.rejectedReason,
                }
              : g,
          );
          const nextGate = status === 'approved' ? Math.min(gateId + 1, 4) as GateId : p.currentGate;
          const projectStatus =
            status === 'approved' && gateId === 4 ? 'completed' : p.status === 'draft' ? 'active' : p.status;
          return {
            ...p,
            gates,
            currentGate: status === 'approved' ? nextGate : p.currentGate,
            status: projectStatus,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const addComment = useCallback(
    (projectId: string, gateId: GateId, content: string, authorName: string, authorRole: string) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            gates: p.gates.map((g) =>
              g.id === gateId
                ? {
                    ...g,
                    comments: [
                      ...g.comments,
                      {
                        id: generateId(),
                        authorName,
                        authorRole,
                        content,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : g,
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const submitForReview = useCallback((projectId: string, gateId: GateId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          status: 'active',
          gates: p.gates.map((g) =>
            g.id === gateId ? { ...g, status: 'in_review' as TollgateStatus } : g,
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  return { projects, addProject, updateGateStatus, addComment, submitForReview };
}
