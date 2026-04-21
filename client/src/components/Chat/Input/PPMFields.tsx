import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useChatFormContext } from '~/Providers';
import { useAgentsMapContext } from '~/Providers/AgentsMapContext';
import { useChatContext } from '~/Providers/ChatContext';
import { useAuthContext } from '~/hooks/AuthContext';

interface PPMProject {
  code: string;
  name: string;
}

interface PPMTask {
  id: number | string;
  name: string;
  project_code?: string;
}

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const firstArray = Object.values(obj).find((v) => Array.isArray(v));
    if (firstArray) return firstArray as T[];
  }
  console.warn('[PPMFields] unexpected response format:', data);
  return [];
}

async function fetchPPMProjects(token: string): Promise<PPMProject[]> {
  const res = await fetch('/api/ppm/projects', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return toArray<PPMProject>(data);
}

async function fetchPPMTasks(token: string, projectCode: string): Promise<PPMTask[]> {
  const res = await fetch(`/api/ppm/tasks?projectCode=${encodeURIComponent(projectCode)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return toArray<PPMTask>(data);
}

export default function PPMFields() {
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const methods = useChatFormContext();

  const { token } = useAuthContext();

  const agentName = agentsMap?.[conversation?.agent_id ?? '']?.name;
  const isPPM = agentName === 'PPM';

  const [selectedProject, setSelectedProject] = useState<PPMProject | null>(null);
  const [selectedTask, setSelectedTask] = useState<PPMTask | null>(null);

  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ['ppm-projects'],
    queryFn: () => fetchPPMProjects(token ?? ''),
    enabled: isPPM && !!token,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: tasks = [],
    isLoading: tasksLoading,
  } = useQuery({
    queryKey: ['ppm-tasks', selectedProject?.code],
    queryFn: () => fetchPPMTasks(token ?? '', selectedProject!.code),
    enabled: isPPM && selectedProject != null && !!token,
    staleTime: 2 * 60 * 1000,
  });

  const handleProjectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const code = e.target.value;
      const project = projects.find((p) => p.code === code) ?? null;
      setSelectedProject(project);
      setSelectedTask(null);
    },
    [projects],
  );

  const handleTaskChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      const task = tasks.find((t) => String(t.id) === id) ?? null;
      setSelectedTask(task);
    },
    [tasks],
  );

  const insertIntoText = useCallback(() => {
    if (!selectedProject) return;
    const current = methods.getValues('text') ?? '';
    const separator = current.length > 0 && !current.endsWith('\n') ? '\n' : '';
    let insertion = `Proiect: ${selectedProject.code}`;
    if (selectedTask) {
      insertion += ` | Task: ${selectedTask.name}`;
    }
    methods.setValue('text', current + separator + insertion, { shouldValidate: true });
  }, [selectedProject, selectedTask, methods]);

  if (!isPPM) return null;
  if (projectsError) console.error('[PPMFields] projects error:', projectsError);

  const selectClass =
    'h-7 cursor-pointer appearance-none rounded-2xl border border-border-medium bg-surface-secondary px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex items-center gap-1.5">
      <select
        className={selectClass}
        value={selectedProject?.code ?? ''}
        onChange={handleProjectChange}
        disabled={projectsLoading}
      >
        <option value="">{projectsLoading ? 'Loading...' : '📁 Project'}</option>
        {projects.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={selectedTask ? String(selectedTask.id) : ''}
        onChange={handleTaskChange}
        disabled={!selectedProject || tasksLoading}
      >
        {!selectedProject ? (
          <option value="">📋 Task</option>
        ) : (
          <>
            <option value="">{tasksLoading ? 'Loading...' : '📋 Task'}</option>
            {tasks.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </>
        )}
      </select>

      {selectedProject && (
        <button
          type="button"
          onClick={insertIntoText}
          className="h-7 rounded-2xl border border-border-medium bg-surface-secondary px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary active:scale-95"
        >
          + Add
        </button>
      )}
    </div>
  );
}
